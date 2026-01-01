
export default function Footer() {
    return (
        <footer className="w-full py-6 mt-12 border-t border-border/40">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} Ruslan Sidukov.</p>
            </div>
        </footer>
    );
}
