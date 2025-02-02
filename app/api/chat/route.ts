import { NextResponse } from "next/server";
import { createClient } from "@/app/supabase-server";
import { formatTemperature } from "@/utils/weather";
import type { ForecastDay } from "@/types/weather";

export async function POST(request: Request) {
  try {
    const { query, location, weatherData } = await request.json();
    
    // Get the user's session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in to use this feature" },
        { status: 401 }
      );
    }

    // Get user's OpenAI API key
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("openai_api_key")
      .eq("user_id", user.id)
      .single();

    if (settingsError || !settings) {
      console.error("Error fetching settings:", settingsError);
      return NextResponse.json(
        { error: "Error fetching user settings" },
        { status: 500 }
      );
    }

    if (!settings.openai_api_key) {
      return NextResponse.json(
        { error: "Please add your OpenAI API key in settings" },
        { status: 400 }
      );
    }

    // Format current weather data for the prompt
    const current = weatherData?.current;
    const forecast = weatherData?.forecast?.forecastday?.[0]?.day;
    const locationInfo = weatherData?.location;
    
    let weatherInfo = "";
    if (current && forecast && locationInfo) {
      // Format the time in the location's timezone
      const localTime = new Date(locationInfo.localtime);
      const timeString = localTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true,
        timeZone: locationInfo.tz_id 
      });
      const dayString = localTime.toLocaleDateString('en-US', {
        weekday: 'long',
        timeZone: locationInfo.tz_id
      });

      // Format the 6-day forecast
      const futureForecast = weatherData.forecast.forecastday.slice(1, 7).map((day: ForecastDay) => {
        const date = new Date(day.date + "T00:00:00");
        return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: locationInfo.tz_id })}:
  - High/Low: ${formatTemperature(day.day.maxtemp_f, "F")}/${formatTemperature(day.day.mintemp_f, "F")}
  - Condition: ${day.day.condition.text}
  - Chance of rain: ${day.day.daily_chance_of_rain}%`;
      }).join('\n\n');

      weatherInfo = `
Current weather in ${location} (Local time: ${timeString} on ${dayString}):
- Temperature: ${formatTemperature(current.temp_f, "F")} (Feels like ${formatTemperature(current.feelslike_f, "F")})
- Condition: ${current.condition.text}
- Humidity: ${current.humidity}%
- Wind: ${current.wind_mph} mph
- Chance of rain: ${forecast.daily_chance_of_rain}%
- High/Low: ${formatTemperature(forecast.maxtemp_f, "F")}/${formatTemperature(forecast.mintemp_f, "F")}
- Sunrise: ${weatherData.forecast.forecastday[0].astro.sunrise}
- Sunset: ${weatherData.forecast.forecastday[0].astro.sunset}

6-Day Forecast:
${futureForecast}`;
    }

    const prompt = `You are a helpful weather assistant with access to both current conditions and future forecast. Here is the weather information:

${weatherInfo}

User asks: ${query}

Please provide a helpful, natural response based on both current weather conditions and the forecast. If the user's question relates to future weather, include relevant forecast information. Focus on answering the user's specific question while incorporating relevant weather data and time-specific context. Keep the response concise (1-3 sentences).`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.openai_api_key}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      
      if (openaiResponse.status === 401) {
        return NextResponse.json(
          { error: "Invalid OpenAI API key. Please check your API key in settings" },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: "Error connecting to OpenAI" },
        { status: openaiResponse.status }
      );
    }

    const data = await openaiResponse.json();

    if (!data.choices?.[0]?.message?.content) {
      console.error("Unexpected OpenAI response format:", data);
      return NextResponse.json(
        { error: "Received an invalid response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 