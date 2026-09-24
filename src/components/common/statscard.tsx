import { cn } from "cn"

type StatsData= {
    id: number
    value: string
    description: string
}


const Statscard = ({ data, divided = false }: { data?: StatsData[] | null, divided?: boolean }) => {
  const items = data ?? []

  return (
    <div className={cn(
      "grid w-full min-w-0",
      divided ? "grid-cols-3" : "grid-cols-2 gap-x-3 gap-y-5 pb-6 sm:gap-6 lg:grid-cols-4",
    )}>
    {
      items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            divided
              ? cn("min-w-0 px-2 first:pl-0 sm:px-4", index > 0 && "border-l border-gray-200")
              : "flex min-w-0 max-w-full flex-col items-center px-1",
          )}
        >
          <div className={cn(divided ? "text-lg font-semibold text-black sm:text-2xl" : "h3 mb-1 text-center text-lg font-medium text-black sm:text-xl md:text-2xl")}>{item.value}</div>
          <div className={cn(divided ? "mt-0.5 text-xs text-gray-400 sm:text-sm" : "paragraph w-full text-center text-[11px] leading-snug text-gray-600 wrap-break-word sm:text-sm")}>{item.description}</div>
        </div>
      ))
    }
  </div>
  )
}

export default Statscard