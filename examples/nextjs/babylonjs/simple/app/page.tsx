import ClientOnly from "./client-only";
import Bitbybit from "./bitbybit";

export default function Home() {
    return (
        <ClientOnly>
            <Bitbybit />
        </ClientOnly>
    );
}
