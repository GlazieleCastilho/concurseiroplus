import { prisma } from "@/lib/prisma";
import { TagItem } from "./tag-item";

export const CourseTagsList = async() => {
  const tags = await prisma.courseTag.findMany();
  
  const sortedTags = tags.sort((a, b) => a.name.localeCompare(b.name));

  return (
       <div className="w-full flex gap-2 overflow-auto">
            {sortedTags.map((tag) => (
            <TagItem key={tag.id} tag={tag} />
            ))}
       </div> 
    )
}