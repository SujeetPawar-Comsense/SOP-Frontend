import { Briefcase, GraduationCap } from "lucide-react";

export type UserRole =
  | "project_owner"
  | "vibe_engineer"
  | null;

interface RoleSelectorProps {
  onRoleSelect: (role: UserRole) => void;
  currentRole: UserRole;
}

export default function RoleSelector({
  onRoleSelect,
  currentRole,
}: RoleSelectorProps) {
  const roles = [
    {
      id: "project_owner" as UserRole,
      title: "Project Owner",
      description:
        "Define project goals, requirements, and business rules",
      icon: Briefcase,
      responsibilities: [
        "Define project goals & objectives",
        "Document functional requirements",
        "Upload reference docs & designs",
        "Provide UI/UX guidelines",
      ],
      isUpcoming: false,
    },
    {
      id: "vibe_engineer" as UserRole,
      title: "Vibe Engineer",
      description: "Build applications using context-aware AI prompts",
      icon: GraduationCap,
      responsibilities: [
        "Get AI prompt packs (full context)",
        "Build features 3x faster with AI",
        "Add feedback notes on prompts",
        "Ship production-ready code",
      ],
      isUpcoming: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            Welcome to Project Context Platform
          </h1>
          <p className="text-muted-foreground text-lg">
            Select your role to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = currentRole === role.id;

            return (
              <Card
                key={role.id}
                className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5 neon-glow scale-105"
                    : "border-primary/20 bg-card/80 hover:border-primary/40 hover:scale-102"
                }`}
                onClick={() => onRoleSelect(role.id)}
              >
                <CardHeader>
                  <div className="mb-4 inline-flex p-3 bg-primary/10 rounded-lg neon-glow relative">
                    <Icon className="w-8 h-8 text-primary" />
                    {role.isUpcoming && (
                      <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500/20 text-cyan-400 border-cyan-400/50 neon-glow text-xs text-left">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="text-sm mb-3 text-muted-foreground">
                    Key Responsibilities:
                  </h4>
                  <ul className="space-y-2">
                    {role.responsibilities.map((resp, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-primary mt-1">
                          •
                        </span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>

                  {isSelected && (
                    <Button
                      className="w-full mt-6 bg-primary hover:bg-primary/90 neon-glow"
                      size="lg"
                    >
                      Continue as {role.title}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Need to switch roles? You can change this anytime
            from your dashboard
          </p>
        </div>
      </div>
    </div>
  );
}