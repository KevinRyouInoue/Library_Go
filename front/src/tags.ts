export type TechTag = {
  key: string;
  label: string;
  queries: string[]; // OR bundle for q parameter
};

// Keywords are intended to be used with quotes. Changed to linux.
export const TECH_TAGS: TechTag[] = [
  { key: 'computer-science', label: 'Computer Science', queries: ['Computer Science'] },
  { key: 'network', label: 'Network', queries: ['computer networks', 'network protocols'] },
  { key: 'database', label: 'Database', queries: ['databases', 'database systems', 'SQL'] },
  { key: 'operating-system', label: 'Operating System', queries: ['operating systems', 'linux'] },
  { key: 'software-architecture', label: 'Software Architecture', queries: ['software architecture', 'system design'] },
  { key: 'oop', label: 'Object-Oriented Programming', queries: ['object-oriented programming', 'OOP'] },
  { key: 'data-structure', label: 'Data Structure', queries: ['data structures'] },
  { key: 'algorithm', label: 'Algorithm', queries: ['algorithms', 'algorithm design'] },
  { key: 'software-test', label: 'Software Test', queries: ['software testing', 'test automation', 'unit testing'] },
  { key: 'design-pattern', label: 'Design Pattern', queries: ['design patterns', 'software patterns'] },
  { key: 'git', label: 'Git/GitHub', queries: ['Git', 'GitHub'] },
  { key: 'discrete-math', label: 'Discrete Mathematics', queries: ['discrete mathematics'] },
  { key: 'html-css', label: 'HTML & CSS', queries: ['HTML', 'CSS'] },
  { key: 'javascript', label: 'JavaScript', queries: ['JavaScript'] },
  { key: 'vue', label: 'Vue', queries: ['Vue', 'Vue.js', 'VueJS'] },
  { key: 'django', label: 'Django', queries: ['Django'] },
  { key: 'react', label: 'React', queries: ['React', 'React.js', 'ReactJS'] },
  { key: 'laravel', label: 'Laravel', queries: ['Laravel'] },
  { key: 'angular', label: 'Angular', queries: ['Angular'] },
  { key: 'rails', label: 'Ruby on Rails', queries: ['Ruby on Rails', 'Rails'] },
  { key: 'unity', label: 'Unity', queries: ['Unity'] },
  { key: 'swiftui', label: 'Swift UI', queries: ['SwiftUI', 'Swift UI'] },
  { key: 'uikit', label: 'UIKit (iOS)', queries: ['UIKit', 'iOS'] },
];

export function getQueriesFor(keys: string[]): string[] {
  const set: string[] = [];
  keys.forEach((k) => {
    const t = TECH_TAGS.find((x) => x.key === k);
    if (t) set.push(...t.queries);
  });
  return set;
}


