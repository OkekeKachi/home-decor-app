import type { MetadataRoute } from "next";

const BASE_URL = "https://home-decor-app.vercel.app";
const API_URL = "https://home-decor-app.onrender.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await fetch(
      `${API_URL}/api/products?page=1&limit=100`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const result = await response.json();

    const productUrls: MetadataRoute.Sitemap = result.data.map(
      (product: {
        _id: string;
        updatedAt?: string;
      }) => ({
        url: `${BASE_URL}/products/${product._id}`,
        lastModified: product.updatedAt
          ? new Date(product.updatedAt)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    );

    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: `${BASE_URL}/products`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      ...productUrls,
    ];
  } catch (error) {
    console.error("Sitemap generation failed:", error);

    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: `${BASE_URL}/products`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];
  }
}