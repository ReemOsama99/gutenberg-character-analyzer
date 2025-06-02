# Gutenberg Insights

**Live Demo:** [gutenberg-character-analyzer.vercel.app](https://gutenberg-character-analyzer.vercel.app/)

A web application designed to analyze and visualize character relationships and data from books sourced from Project Gutenberg. It provides users with interactive network graphs, character summaries, and extracted metadata for classic literary works.

## Features

- **Book Analysis:** Fetches and processes book data from Project Gutenberg using a book ID.
- **Metadata Display:** Shows key information about the book, such as title, author, and publication date.
- **Character Network Visualization:** Interactive graph displaying characters as nodes and their relationships as edges, powered by React Flow.
- **Animated Character Cards:** Flip cards present character roles on the front and detailed descriptions (name, description, traits) on the back, animated with Framer Motion.
- **Dynamic Filtering/Interaction:** Users can interact with the graph (pan, zoom) and character cards.
- **Responsive Design:** Adapts to various screen sizes for a seamless experience on desktop and mobile.
- **Dark Mode Support:** Theme adapts based on user's system preference.

## How to Use

1.  Once the application is running, you will see an input field.
2.  Enter a valid Project Gutenberg Book ID (e.g., `11` for "Alice's Adventures in Wonderland").
3.  Click the "Analyze Book" button.
4.  Wait for the analysis to complete. You will see loading indicators during this process.
5.  Once loaded, the book metadata, character list (with flippable cards), and the character relationship graph will be displayed.
6.  Interact with the graph by dragging nodes, panning, and zooming. Flip character cards to see more details.

## Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (React Framework)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Graph Visualization:** [React Flow](https://reactflow.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18.x or later recommended)
- npm, yarn, pnpm, or bun (choose one)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/gutenberg-character-analyzer.git # Replace with your repo URL
   ```
2. Navigate to the project directory:
   ```bash
   cd gutenberg-character-analyzer
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

### Running the Development Server

Execute one of the following commands based on your package manager:

```bash
npm run dev
# or
_yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.