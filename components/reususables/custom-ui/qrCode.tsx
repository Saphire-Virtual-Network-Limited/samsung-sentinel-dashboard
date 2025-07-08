"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";
const DynamicQRCode = ({ value }: { value: string }) => {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    if (value) {
      QRCode.toDataURL(value, { width: 200 })
        .then(url => setQrUrl(url))
        .catch(console.error);
    }
  }, [value]);

  return (
    <div>
      <p>QR Code for: <strong>{value}</strong></p>
      {qrUrl && <Image src={qrUrl} alt="QR Code" />}
    </div>
  );
};

export default DynamicQRCode;
