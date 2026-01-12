import Image from "next/image";

const contributors = [
  {
    name: "Ms Charanya Ramakrishnan",
    image: "/contributors/char.jpeg",
    role: "Course Director - Bachelor of IT | Development Supervisor",
  },
  {
    name: "Khoi Nguyen Vu",
    image: "/contributors/khoinguyenvu.jpg",
    role: "Bachelor of CyberSecurity | Lead Software Developer",
  },
  {
    name: "Tran Khoi Nguyen Nguyen",
    image: "/contributors/khoinguyennguyen.jpg",
    role: "Bachelor of Information Technology | Software Developer",
  },
];

export default function Contributors() {
  return (
    <div className="w-full mt-0 mb-20">
      <div className="mb-5 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-3">
          Our Contributors
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          The people behind the product, passionate about what they do.
        </p>
      </div>
      <div className="flex flex-wrap items-stretch justify-center gap-8">
        {contributors.map((contributor, index) => (
          <div
            key={contributor.name}
            className="group relative w-full max-w-[320px] bg-card border border-border rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="relative h-[300px] overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
              <Image
                src={contributor.image}
                alt={contributor.name}
                width={500}
                height={500}
                className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            <div className="relative px-6 py-6 text-center space-y-3">
              <h3 className="text-xl font-semibold text-foreground leading-tight">
                {contributor.name}
              </h3>
              <p className="text-sm font-medium bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text leading-relaxed">
                {contributor.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
