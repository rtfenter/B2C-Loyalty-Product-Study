export function BrandMark({ className = '' }: { className?: string }) {
  return <svg className={className} width="32" height="32" viewBox="0 0 40 40" fill="currentColor" aria-hidden="true"><path d="M18 18C6 18 4 9 4 3c9 0 16 5 14 15ZM22 18C22 6 31 4 37 4c0 9-5 16-15 14ZM22 22c12 0 14 9 14 15-9 0-16-5-14-15ZM18 22C18 34 9 36 3 36c0-9 5-16 15-14Z"/></svg>;
}
export function ReferenceImage({ crop, label, className = '' }: { crop: string; label: string; className?: string }) {
  return <svg className={className} viewBox={crop} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}><image href={`${import.meta.env?.BASE_URL ?? "/"}images/form-reference.png`} width="1536" height="1024"/></svg>;
}
