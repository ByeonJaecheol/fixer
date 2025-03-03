import Image from "next/image";
import { APP_NAME } from "./constants/constNames";
import LoginForm from "./_components/auth/LoginForm";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 ">

        <div className="lg:pl-12 max-w-md mx-auto">
          <LoginForm />
        </div>
        
      </div>
  );
}
