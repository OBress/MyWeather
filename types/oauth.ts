import React from 'react'
import { Provider } from "@supabase/supabase-js";



export type OAuthProvider = {
    name:Provider;
    displayName:string;
    icon?:React.ReactNode;
};