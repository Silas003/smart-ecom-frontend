export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-6 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} Ecommerce. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-200">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-200">
            Terms
          </a>
          <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-200">
            Help
          </a>
        </div>
      </div>
    </footer>
  );
}
