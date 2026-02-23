export default function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar-background mt-16">
      <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-foreground">CaféInvest Rwanda</span>
          <span className="opacity-40">|</span>
          <span>African Leadership University Research Initiative</span>
        </div>
        <p className="text-center md:text-right max-w-md opacity-70">
          Investment intelligence platform. Data provided for analytical purposes only.
          Past returns do not guarantee future performance. Not financial advice.
        </p>
      </div>
    </footer>
  );
}
