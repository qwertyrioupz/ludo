"use client"

import React, { memo, useMemo } from "react"
import Cell from "@/components/cell"

interface HorizontalPathProps {
  cells: number[]
  color: string
}

const HorizontalPath = memo(({ cells, color }: HorizontalPathProps) => {
  const groupedCells = useMemo(() => {
    const groups: number[][] = []

    for (let i = 0; i < cells.length; i += 6) {
      groups.push(cells.slice(i, i + 6))
    }

    return groups
  }, [cells])

  return (
    <div className="flex h-full w-[40%] items-center justify-center overflow-hidden">
      <div className="flex h-full w-full flex-col">
        {groupedCells.map((group, groupIndex) => (
          <div
            key={`horizontal-group-${groupIndex}`}
            className="flex w-full flex-1 flex-row"
          >
            {group.map((id) => (
              <div key={`cell-wrapper-${id}`} className="h-full flex-1">
                <Cell id={id} color={color} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
})

HorizontalPath.displayName = "HorizontalPath"

export default HorizontalPath