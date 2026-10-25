import { CVProvider } from "@/context/CVContext";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <CVProvider>
      {children}
    </CVProvider>
  );
}