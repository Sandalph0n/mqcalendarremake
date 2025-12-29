import Link from "next/link";

const SiteFooter = () => {
  const links = [
    { label: "About", href: "/about" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Document", href: "#" },
  ];

  return (
    <footer className="bg-[#353734] text-white py-6 shadow-inner">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-sm text-gray-200">© 2025 MQ Assignment Planner. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default SiteFooter;
