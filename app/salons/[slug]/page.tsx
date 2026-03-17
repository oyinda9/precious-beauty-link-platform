import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SalonDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  const salon = await prisma.salon.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
      phone: true,
      createdAt: true,
    },
  });

  if (!salon) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/salons/nearby"
          className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 mb-6"
        >
          ← Back to nearby salons
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{salon.name}</h1>
              <p className="text-sm text-gray-500 mt-2">
                Registered salon on Precious Beauty Link
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/salons/nearby"
                className="px-5 py-3 rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                Browse More
              </Link>

              <a
                href={salon.phone ? `tel:${salon.phone}` : "#contact"}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800"
              >
                Book Now
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Address</p>
              <p className="text-gray-800">{salon.address || "No address provided"}</p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">City</p>
              <p className="text-gray-800">{salon.city || "No city provided"}</p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Phone</p>
              {salon.phone ? (
                <a href={`tel:${salon.phone}`} className="text-purple-600 hover:text-purple-700">
                  {salon.phone}
                </a>
              ) : (
                <p className="text-gray-800">No phone provided</p>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Salon Page</p>
              <p className="text-gray-800 break-all">/salons/{salon.slug}</p>
            </div>
          </div>

          <div id="contact" className="mt-8 rounded-2xl bg-purple-50 border border-purple-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Book this salon</h2>
            <p className="text-gray-600 mb-4">
              For now, booking goes through direct contact with the salon.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {salon.phone ? (
                <a
                  href={`tel:${salon.phone}`}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
                >
                  Call to Book
                </a>
              ) : null}

              <Link
                href="/salons/nearby"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-purple-200 text-purple-600 hover:bg-white"
              >
                Find Another Salon
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}