export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Todo App. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
