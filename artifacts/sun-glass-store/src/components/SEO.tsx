import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export function SEO({
  title = "Sun Glass | Tienda de Llaveros y Accesorios",
  description = "Descubre nuestra colección exclusiva de llaveros y accesorios, incluyendo modelos especiales de la Copa Mundial. Compra ahora y destaca tu estilo.",
  keywords = "llaveros, accesorios, copa mundial, sun glass, tienda online",
  image = "/favicon.svg", // Fallback to a default image
  url = "https://sunglass-sun-glass-store.vercel.app"
}: SEOProps) {
  const fullTitle = title.includes("Sun Glass") ? title : `${title} | Sun Glass`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
}
