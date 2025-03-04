interface ContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function Container({ title, description, children }: ContainerProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {description && (
          <p className="text-gray-600 mb-8">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
} 