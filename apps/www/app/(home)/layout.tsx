import { Header } from "@/components/blocks/header";
import { Footer } from "@/components/blocks/footer";

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<>
			<Header />
			{children}
			<Footer />
		</>
	);
}
