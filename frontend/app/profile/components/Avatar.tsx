import Image from "next/image";

export default function Avatar({ initials, image, large = false }: { initials: string; image?: string; large?: boolean }) {
  return (
    <div className={large ? "avatar avatar-large" : "avatar"}>
      {image ? <Image src={image} alt="" width={large ? 104 : 28} height={large ? 104 : 28} unoptimized /> : <span>{initials || "U"}</span>}
    </div>
  );
}
