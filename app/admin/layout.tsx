export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Como o RootLayout já envolve tudo em Providers, 
          não precisamos repetir o AuthProvider aqui. 
          Basta renderizar os componentes filhos do Admin. */}
      {children}
    </>
  );
}