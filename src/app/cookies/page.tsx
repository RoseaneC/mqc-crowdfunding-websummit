import LegalPage from "../../components/legal/legalPage";

export const metadata = {
  title: "Política de Cookies | Mulheres Que Codam",
  description: "Política de Cookies da plataforma Mulheres Que Codam.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Cookies"
      title="Política de Cookies"
      description="Esta política explica como a plataforma Mulheres Que Codam utiliza cookies e tecnologias semelhantes para melhorar a experiência, proteger sessões e apoiar funcionalidades relacionadas à rede Stellar."
      lastUpdated="05 de março de 2026"
      sections={[
        {
          title: "1. Sobre esta Política",
          paragraphs: [
            "A plataforma Mulheres Que Codam, operada em parceria pelo Instituto Florescer Caldeira e pela ITS Cripto Educacional, utiliza cookies e tecnologias semelhantes para garantir uma experiência mais segura, funcional e personalizada.",
            "Essas tecnologias também podem apoiar recursos técnicos relacionados à navegação, autenticação, integração com carteiras digitais, emissão de recibos digitais e interação com funcionalidades baseadas na rede Stellar.",
          ],
        },
        {
          title: "2. O que são cookies",
          paragraphs: [
            "Cookies são pequenos arquivos de texto armazenados no navegador ou dispositivo da pessoa usuária quando ela acessa um site ou plataforma digital.",
            "Eles ajudam a reconhecer preferências, manter sessões ativas, melhorar a navegação, entender como a plataforma é utilizada e viabilizar determinadas funcionalidades técnicas.",
          ],
        },
        {
          title: "3. Cookies essenciais",
          paragraphs: [
            "Utilizamos cookies essenciais para permitir o funcionamento básico e seguro da plataforma.",
            "Esses cookies podem ser necessários para login, manutenção de sessão, navegação entre páginas, proteção contra uso indevido e integração com a carteira Stellar durante operações realizadas pela pessoa usuária.",
            "Sem esses cookies, algumas funcionalidades podem não funcionar corretamente, incluindo recursos relacionados à visualização de recibos digitais, conexão de carteira ou acompanhamento de interações realizadas na plataforma.",
          ],
        },
        {
          title: "4. Cookies analíticos",
          paragraphs: [
            "Podemos utilizar cookies analíticos para compreender como a plataforma é acessada, quais páginas são mais visitadas, quais campanhas geram maior engajamento e como melhorar a experiência das pessoas usuárias.",
            "Ferramentas como Google Analytics ou soluções semelhantes podem ser utilizadas para gerar métricas agregadas sobre navegação, desempenho, origem de acessos e impacto geográfico das campanhas.",
            "Sempre que possível, buscamos utilizar informações agregadas ou não diretamente identificáveis para análise de desempenho e melhoria contínua da plataforma.",
          ],
        },
        {
          title: "5. Cookies funcionais",
          paragraphs: [
            "Cookies funcionais podem ser utilizados para lembrar preferências da pessoa usuária, como idioma, escolhas de navegação, dados preenchidos anteriormente ou configurações da interface.",
            "Esses cookies também podem facilitar o preenchimento de formulários, etapas de verificação, processos relacionados a KYC e interações recorrentes com a plataforma.",
            "A utilização desses cookies tem como objetivo tornar a experiência mais simples, eficiente e adequada às preferências da pessoa usuária.",
          ],
        },
        {
          title: "6. Cookies de terceiros",
          paragraphs: [
            "A plataforma pode utilizar serviços de terceiros que empregam cookies ou tecnologias semelhantes, incluindo ferramentas de análise, hospedagem, autenticação, segurança, carteiras digitais, infraestrutura blockchain ou serviços incorporados.",
            "Esses terceiros podem coletar informações de acordo com suas próprias políticas de privacidade e cookies.",
            "Recomendamos que a pessoa usuária consulte as políticas dos serviços de terceiros utilizados sempre que desejar compreender melhor como essas ferramentas tratam informações.",
          ],
        },
        {
          title: "7. Como gerenciar cookies",
          paragraphs: [
            "A pessoa usuária pode configurar seu navegador para bloquear, remover ou alertar sobre o uso de cookies.",
            "No entanto, a desativação de cookies essenciais poderá comprometer o funcionamento da plataforma e impedir o acesso a determinadas funcionalidades, como login, conexão com carteira, manutenção de sessão ou visualização de recibos digitais em NFT.",
            "As configurações de cookies podem variar conforme o navegador utilizado. Consulte as opções de privacidade e segurança do seu navegador para ajustar suas preferências.",
          ],
        },
        {
          title: "8. Alterações nesta Política",
          paragraphs: [
            "Esta Política de Cookies poderá ser atualizada periodicamente para refletir mudanças na plataforma, nas ferramentas utilizadas, nas funcionalidades disponíveis ou nos requisitos legais aplicáveis.",
            "A versão vigente estará sempre disponível nesta página, com indicação da data de última atualização.",
          ],
        },
      ]}
    />
  );
}
