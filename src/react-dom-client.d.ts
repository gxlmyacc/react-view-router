declare module 'react-dom/client' {
  export interface Root {
    render(element: any): void;
    unmount(): void;
  }

  export function hydrateRoot(container: any, element: any): Root;
}
