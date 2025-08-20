import Image from "next/image";
import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";


export default function Home() {
  return <h1>hello i am a good


    <LoginLink>Sign in</LoginLink>

    <RegisterLink>Sign up</RegisterLink>
  </h1>;
}
