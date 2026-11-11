"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { HealthTestGroup } from "./healthDetailTypes";
import styles from "./HealthDetail.module.css";

export default function HealthTestGroups({ groups, idPrefix, headingLevel = 3 }: { groups: HealthTestGroup[]; idPrefix: string; headingLevel?: 3 | 4 }) {
  const [openGroups, setOpenGroups] = useState<number[]>([]);
  const Heading = headingLevel === 4 ? "h4" : "h3";
  const expandableIndexes = groups.flatMap((group, index) => group.parameters.length || group.description ? [index] : []);
  const allOpen = expandableIndexes.length > 0 && expandableIndexes.every(index => openGroups.includes(index));
  return <>
    {expandableIndexes.length > 1 && <div className={styles.expandControls}><button className={styles.textAction} type="button" onClick={() => setOpenGroups(allOpen ? [] : expandableIndexes)}>{allOpen ? "Collapse all" : "Expand all"}</button></div>}
    <div className={styles.tests}>{groups.map((group, index) => {
      const expandable = Boolean(group.parameters.length || group.description);
      const open = openGroups.includes(index);
      const countLabel = group.itemLabel === "tests" ? group.parameters.length === 1 ? "test" : "tests" : group.parameters.length === 1 ? "parameter" : "parameters";
      return <div className={styles.test} key={`${group.name}-${index}`}>
        {expandable ? <Heading><button type="button" className={styles.testTrigger} aria-expanded={open} aria-controls={`${idPrefix}-${index}`} onClick={() => setOpenGroups(current => open ? current.filter(value => value !== index) : [...current, index])}><span>{group.name}{group.parameters.length > 0 && <small>{group.parameters.length} {countLabel}</small>}</span><ChevronDown aria-hidden /></button></Heading> : <Heading className={styles.plainTest}>{group.name}</Heading>}
        {expandable && <div id={`${idPrefix}-${index}`} hidden={!open} className={styles.parameters}>{group.description && <p>{group.description}</p>}{group.parameters.length > 0 && <ul>{group.parameters.map((parameter, parameterIndex) => <li key={`${parameter}-${parameterIndex}`}><span>{parameter}</span>{group.parameterDetails?.[parameterIndex]?.description && <p>{group.parameterDetails[parameterIndex].description}</p>}</li>)}</ul>}</div>}
      </div>;
    })}</div>
  </>;
}
