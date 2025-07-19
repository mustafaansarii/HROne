import { SchemaBuilder } from "@/components/SchemaBuilder";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-inter">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
            JSON Schema Builder
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Schema Builder</h2>
              <SchemaBuilder />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">JSON Preview</h2>
              <div id="json-preview" className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;