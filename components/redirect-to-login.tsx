import { redirect } from "next/navigation";

export function RedirectToLogin() {
    redirect("/login");
}
