function MultiCheck({
  options, values, onChange
}: { options: string[]; values: string[]; onChange: (vals: string[]) => void }) {
  const toggle = (val: string) => {
    const set = new Set(values)
    set.has(val) ? set.delete(val) : set.add(val)
    onChange(Array.from(set))
  }
  return (
    <details className="relative">
      <summary className="cursor-pointer select-none rounded border px-2 h-8 flex items-center">
        {values.length ? `${values.length} selecionado(s)` : "Filtrar…"}
      </summary>
      <div className="absolute z-10 mt-1 w-56 rounded border bg-white p-2 shadow">
        <div className="max-h-52 overflow-auto space-y-1">
          {options.map(op => (
            <label key={op} className="flex items-center gap-2">
              <input type="checkbox" checked={values.includes(op)} onChange={()=>toggle(op)} />
              <span className="text-sm">{op}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 text-right">
          <button type="button" className="text-xs underline" onClick={()=>onChange([])}>Limpar</button>
        </div>
      </div>
    </details>
  )
}