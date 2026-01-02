interface DataFlowLineProps {
  direction: "horizontal" | "vertical";
  className?: string;
}

const DataFlowLine = ({ direction, className = "" }: DataFlowLineProps) => {
  return (
    <div 
      className={`relative overflow-hidden ${
        direction === "horizontal" ? "h-px w-full" : "w-px h-full"
      } ${className}`}
    >
      <div 
        className={`absolute bg-gradient-to-r from-transparent via-primary to-transparent ${
          direction === "horizontal" 
            ? "w-1/3 h-full animate-data-stream" 
            : "h-1/3 w-full"
        }`}
        style={{
          animation: direction === "horizontal" 
            ? "data-stream 2s ease-in-out infinite" 
            : "data-stream 2s ease-in-out infinite"
        }}
      />
      <div className={`absolute inset-0 bg-border/30`} />
    </div>
  );
};

export default DataFlowLine;
