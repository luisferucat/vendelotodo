export default function PageHeader({ eyebrow, title, description, actions }) {
  return <header className="portal-page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="button-row">{actions}</div>}</header>
}
