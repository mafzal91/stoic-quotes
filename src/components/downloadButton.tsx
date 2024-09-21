"use client";
import * as React from "react";
import { FooterButton } from "@/components/footerButton";
import { Loader } from "@/components/loader";

export function DownloadLink({
  children,
  url,
}: {
  children: React.ReactNode;
  url: string;
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await fetch(url).finally(() => setIsLoading(false));
  };

  if (isLoading) return <Loader />;
  return (
    <FooterButton onClick={handleClick}>
      <div className="m-2 mx-2 p-1">{children}</div>
    </FooterButton>
  );
}

export function DownloadButtonIframe({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const quote_id = window.location.pathname.split("/").pop();
  const base_url = window.location.origin;
  const url = `${base_url}/image/${quote_id}`;

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handleDownload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = url;
      setIsLoading(true);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);

    if (iframeRef.current) {
      iframeRef.current.src = "";
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={isLoading}
        className="inline-flex w-full justify-center rounded-md bg-background px-3 py-2 text-sm font-semibold text-primary hover:text-background hover:bg-primary border-[1px] border-primary sm:ml-3 sm:w-auto"
        onClick={handleDownload}
      >
        {isLoading ? <Loader /> : children}
      </button>
      <iframe
        id="downloadFrame"
        ref={iframeRef}
        className="hidden"
        onLoad={handleLoad}
      />
    </>
  );
}

export function DownloadButton({ children }: { children: React.ReactNode }) {
  const quote_id = window.location.pathname.split("/").pop();
  const base_url = window.location.origin;
  const url = `${base_url}/image/${quote_id}`;

  const onClick = () => {
    window.open(url, "_blank");
  };

  return (
    <button
      className="inline-flex w-full justify-center rounded-md bg-background px-3 py-2 text-sm font-semibold text-primary hover:text-background hover:bg-primary border-[1px] border-primary sm:ml-3 sm:w-auto"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
