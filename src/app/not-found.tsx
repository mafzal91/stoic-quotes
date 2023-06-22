import { FooterLink } from "@/components/footerItem";
import { Divider } from "@/components/divider";

export default function NotFound() {
  return (
    <>
      <div className="flex flex-col flex-grow items-center place-items-center">
        <div className="container mx-auto md:max-w-5xl sm:px-6 lg:px-8 py-12 text-center">
          Not Found
        </div>
      </div>

      {/*  */}

      <div className="flex items-center lg:mb-0 lg:text-left">
        <Divider />
        <FooterLink href={`/random`}>Random</FooterLink>
        <Divider />
      </div>
    </>
  );
}
