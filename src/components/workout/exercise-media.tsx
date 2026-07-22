import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export type Media = { type: "image" | "gif" | "video"; url: string };

/** Converte um link do YouTube (watch/youtu.be/shorts/embed) em URL de embed. */
function youtubeEmbed(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0` : null;
}

/** Mídia do exercício (vídeo/GIF/imagem) ou placeholder de marca quando não há. */
export function ExerciseMedia({
  media,
  label,
  className,
}: {
  media: Media[];
  label: string;
  className?: string;
}) {
  const primary = media[0];
  const isVideo = primary?.type === "video";
  const yt = isVideo ? youtubeEmbed(primary.url) : null;

  return (
    <div
      className={cn(
        "bg-muted relative aspect-square w-full overflow-hidden rounded-3xl",
        className,
      )}
    >
      {primary ? (
        yt ? (
          <iframe
            src={yt}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="size-full"
          />
        ) : isVideo ? (
          <video src={primary.url} controls playsInline className="size-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={primary.url} alt={label} className="size-full object-cover" />
        )
      ) : (
        <div className="from-primary/15 via-muted to-muted flex size-full flex-col items-center justify-center gap-3 bg-gradient-to-br">
          <div className="bg-background/60 text-primary flex size-20 items-center justify-center rounded-2xl backdrop-blur">
            <Dumbbell className="size-9" />
          </div>
          <span className="text-muted-foreground text-sm font-medium">{label}</span>
        </div>
      )}
    </div>
  );
}
