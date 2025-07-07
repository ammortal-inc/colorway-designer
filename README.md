# Colorway Designer

A modern web application for designing custom colorways for plastic sheets manufactured from recycled plastic chips.

## Features

- **Interactive Color Palette**: Add up to 10 custom colors using hex codes
- **Real-time Visualization**: See how your colors will look when mixed as plastic chips
- **Voronoi Diagram**: Accurate representation of random color distribution in manufacturing
- **Responsive Design**: Works on desktop and mobile devices
- **Intuitive Interface**: Clean, modern UI with sidebar controls

## How It Works

1. **Add Colors**: Use the sidebar to input hex color codes (e.g., #FF0000, #00FF00)
2. **View Preview**: The main area shows a Voronoi diagram representing your plastic sheet
3. **Regenerate**: Click "Regenerate Pattern" to see different random distributions
4. **Manage Colors**: Remove unwanted colors with the X button in the palette

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **D3-Delaunay** for Voronoi diagram generation
- **Canvas API** for high-performance rendering

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Usage

The application starts with 4 demo colors to showcase the functionality. You can:

- Add new colors using hex codes
- Remove existing colors
- Regenerate the pattern to see different distributions
- View how equal proportions of each color would appear in a manufactured sheet

## About Voronoi Diagrams

The visualization uses Voronoi diagrams to simulate how plastic chips would naturally distribute during the manufacturing process. Each cell in the diagram represents a region closest to a particular chip, creating a realistic representation of the final product.

## License

This project is licensed under the MIT License.