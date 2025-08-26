import { supabase }  from "@/lib/supabase";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest , NextResponse } from "next/server";

export async function POST() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (user) {
    // Try inserting into Supabase if not exists
    const { data, error } = await supabase
      .from("users")
      .upsert({
        email: user.email,
        name: user.given_name + " " + user.family_name,
        auth_user_id: user.id
      }, { onConflict: "email" });

    if (error) {
      console.error("Supabase error:", error.message);
    } else {
      console.log("User registered:", data);
    }
  }

  return NextResponse.json(user) ;
}
