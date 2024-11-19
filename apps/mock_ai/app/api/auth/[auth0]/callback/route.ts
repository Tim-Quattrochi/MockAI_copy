// api/auth/[auth0]/callback/route.ts
import { NextApiRequest, NextApiResponse } from "next";
import {
  handleAuth,
  handleCallback,
  Session,
} from "@auth0/nextjs-auth0";
import { supabase } from "@/lib/supabase";

interface Auth0User {
  email: string;
  name: string;
  sub: string;
}

export const GET = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const session = (await handleCallback(req, res)) as Session;

    const { user } = session;

    if (!user) {
      return res.status(400).send("User not found in session");
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", user.email)
      .single();

    if (error && error.code !== "PGRST100") {
      console.error("Error checking for existing user:", error);
      return res.status(500).send("Error checking user data");
    }

    if (!data) {
      const { error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email: user.email,
            name: user.name,
            auth0_user_id: user.sub,
          },
        ]);

      if (insertError) {
        console.error(
          "Error inserting user into Supabase:",
          insertError
        );
        return res.status(500).send("Error saving user to Supabase");
      }

      console.log("User inserted into Supabase:", user.email);
    } else {
      console.log("User already exists in Supabase:", user.email);
    }

    return res.redirect("/interview");
  } catch (error) {
    console.error("Error during Auth0 callback:", error);
    return res.status(500).send("Error during authentication");
  }
};
