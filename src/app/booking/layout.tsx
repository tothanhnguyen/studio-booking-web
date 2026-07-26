export default function BookingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="transaction-shell" data-page-shell="transaction">
      {children}
    </div>
  );
}
