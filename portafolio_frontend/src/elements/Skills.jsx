import SectionTitle from './SectionTitle';
import SkillCard from './SkillCard';

function Skills({ skills = [] }) {
  return (
    <section className="section">
      <SectionTitle eyebrow="Skills" title="Conocimiento en" align="center" />
      <div className="skill-grid">
        {skills.map((skill) => (
          <SkillCard key={skill.name} name={skill.name} />
        ))}
      </div>
    </section>
  );
}

export default Skills;
