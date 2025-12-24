type LegendItem = {
  name: string;
  value: number;
  color: string;
};

const PieLegend = ({ items }: { items: LegendItem[] }) => (
  <div className="mt-4 space-y-2">
    {items.map((item) => (
      <div key={item.name} className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
          <span className="text-muted-foreground">{item.name}</span>
        </div>
        <span className="font-medium text-foreground">{item.value}</span>
      </div>
    ))}
  </div>
);
export default PieLegend;
