import clsx from "clsx";
import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Database } from "@/utilities/database";
import { getFullName } from "@/utilities/get-full-name";
import { Circle } from "@/components/circle";
import { Quote } from "@/components/quote";
import { FooterLink } from "@/components/footerLink";
import { Divider } from "@/components/divider";
import { CopyButton } from "@/components/copyButton";
import { HeartIcon } from "@heroicons/react/24/solid";

type Props = {
  params: {
    quote_id: string;
  };
};

export async function generateMetadata({
  params: { quote_id },
}: Props): Promise<Metadata> {
  const quoteData = await new Database().findQuoteById(Number(quote_id));
  if (!quoteData) return {};

  const { first_name, last_name, quote } = quoteData;
  return {
    description: `${quote} - ${getFullName({ first_name, last_name })}`,
  };
}

async function getQuote(
  quote_id: string
): Promise<(QuoteWithAuthor & { count: number }) | null> {
  const db = new Database();
  const quote = await db.findQuoteById(Number(quote_id));
  if (!quote) return null;
  const count = await db.findAuthorQuoteCount(quote.author_id);
  return { ...quote, count };
}

export default async function QuoteByIdPage({ params: { quote_id } }: Props) {
  if (quote_id !== "1296") {
    console.log({ quote_id });
  }
  const quoteData = await getQuote(quote_id);

  if (!quoteData) notFound();

  const { count, ...quote } = quoteData;

  const authorName = quote.first_name
    ? `${quote.first_name} ${quote.last_name ?? ""}`
    : "Unknown";

  const quoteLength = quote.quote.length;
  const baseFontSize = 50 - Math.sqrt(quoteLength);
  const fontSize = Math.max(baseFontSize, 12); // Set a minimum font size

  return (
    <>
      <div className="flex flex-col flex-grow justify-center items-center">
        {/* {quote.image_url && (
          <div className="relative">
            <Circle />

            <div className="absolute w-full top-0 bottom-0 flex items-center justify-center">
              <Image
                className={clsx(
                  "w-48 h-48 sm:w-56 sm:h-56 md:w-96 md:h-96 rounded-full"
                )}
                src={quote.image_url}
                width={256}
                height={256}
                alt={authorName}
              />
              <div className="absolute rounded-full inset-0 mix-blend-color bg-accent"></div>
            </div>
          </div>
        )} */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-center">
          <Quote quote={quote.quote} author={authorName} fontSize={fontSize} />
        </div>
      </div>

      {/*  */}

      <div className="flex flex-wrap items-center justify-center lg:mb-0 lg:text-left screenshot-hidden">
        <FooterLink href={`/random?quote_id=${quote.id}`}>Random</FooterLink>
        {authorName !== "Unknown" && count > 1 && (
          <>
            <Divider />
            <FooterLink
              href={`/author/${quote.author_id}?quote_id=${quote.id}`}
            >
              More from {authorName}
            </FooterLink>
          </>
        )}
        <Divider />
        <CopyButton quote_id={quote.id}>Share this quote</CopyButton>
        <Divider />
        <FooterLink href={"https://mafz.al"} target="_blank" rel="noopener">
          By Mo with{" "}
          <HeartIcon className="inline align-sub h-4 w-4 text-primary" />
        </FooterLink>
      </div>
    </>
  );
}
