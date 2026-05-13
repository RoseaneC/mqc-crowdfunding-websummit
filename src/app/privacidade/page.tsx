import LegalPage from "../../components/legal/legalPage";

export const metadata = {
  title: "Política de Privacidade | Mulheres Que Codam",
  description: "Política de Privacidade da plataforma Mulheres Que Codam.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Privacidade"
      title="Política de Privacidade (LGPD)"
      description="Esta política explica como a Mulheres Que Codam pode coletar, utilizar, compartilhar e proteger informações relacionadas ao uso da plataforma."
      lastUpdated="maio de 2026"
      sections={[
        {
          title: "1. Agentes de tratamento",
          paragraphs: [
            "Para fins desta Política de Privacidade, o Instituto Florescer Caldeira e a ITS Cripto Educacional atuam como controladores dos dados pessoais tratados no contexto da plataforma Mulheres Que Codam, definindo as finalidades e os meios de tratamento aplicáveis.",
            "A rede Stellar é uma infraestrutura tecnológica descentralizada utilizada para registro de determinadas operações em blockchain. Por sua natureza pública e distribuída, informações registradas na rede podem ser verificáveis por terceiros e não dependem exclusivamente dos controladores para sua manutenção.",
            "Serviços técnicos, provedores de infraestrutura, ferramentas de hospedagem, carteiras digitais e outros parceiros operacionais poderão atuar como operadores ou prestadores de serviço, conforme o caso, sempre de acordo com as finalidades descritas nesta Política.",
          ],
        },
        {
          title: "2. Dados coletados e finalidades",
          paragraphs: [
            "Podemos coletar dados de identificação, como nome, CPF e e-mail, quando necessários para viabilizar a emissão de recibos legais de doação, cumprir obrigações regulatórias, prevenir fraudes e apoiar procedimentos relacionados à prevenção à lavagem de dinheiro.",
            "Também podemos tratar dados relacionados à blockchain, como endereço público da carteira Stellar, identificadores de transações, registros públicos de contribuição, Tokens de Impacto e NFTs-recibo vinculados à participação da pessoa usuária na plataforma.",
            "Dados socioeconômicos poderão ser coletados, quando aplicável, para composição de relatórios de impacto social, prestação de contas, mensuração de resultados e atendimento a requisitos de parceiros institucionais, como a Stellar Development Foundation.",
            "Podemos ainda coletar dados enviados voluntariamente por formulários de contato, como nome, e-mail e conteúdo da mensagem, exclusivamente para responder solicitações, dúvidas, sugestões ou propostas de parceria.",
          ],
        },
        {
          title: "3. Bases legais para o tratamento",
          paragraphs: [
            "Tratamos dados pessoais com fundamento nas bases legais previstas na Lei nº 13.709/2018, a Lei Geral de Proteção de Dados Pessoais.",
            "O tratamento poderá ocorrer mediante consentimento da pessoa titular, especialmente quando houver fornecimento voluntário de dados para contato, participação em iniciativas, recebimento de comunicações ou realização de doações.",
            "Também poderemos tratar dados para cumprimento de obrigação legal ou regulatória, incluindo obrigações fiscais, contábeis, regulatórias, de transparência e de prevenção a fraudes ou lavagem de dinheiro.",
            "Quando necessário, o tratamento poderá ocorrer para execução de contrato ou de procedimentos preliminares relacionados a contrato do qual a pessoa titular seja parte, inclusive em futuras operações estruturadas no contexto da regulamentação aplicável, como ofertas ou investimentos sujeitos à CVM 88, quando implementados.",
          ],
        },
        {
          title: "4. Compartilhamento de dados",
          paragraphs: [
            "Dados de identificação poderão ser compartilhados com organizações parceiras, instituições apoiadas, prestadores de serviço e parceiros operacionais quando necessário para emissão de recibos, documentação fiscal, comprovação de doações, prestação de contas ou execução das funcionalidades da plataforma.",
            "Dados de transações realizadas em blockchain, como endereço público da carteira, identificador da transação, valores e registros associados ao contrato inteligente, podem ser públicos e consultáveis por terceiros em exploradores da rede Stellar.",
            "O compartilhamento de dados será limitado ao necessário para cumprir as finalidades informadas nesta Política, respeitando a legislação aplicável e as medidas razoáveis de segurança e governança.",
          ],
        },
        {
          title: "5. Blockchain, transparência e imutabilidade",
          paragraphs: [
            "A plataforma pode utilizar a rede Stellar para registrar informações relacionadas a contribuições, recibos digitais, Tokens de Impacto, NFTs-recibo e outras interações on-chain.",
            "Por se tratar de uma infraestrutura descentralizada, determinadas informações registradas em blockchain podem ser públicas, permanentes, verificáveis e de difícil ou impossível exclusão técnica após sua confirmação na rede.",
            "Recomendamos que a pessoa usuária não insira dados pessoais sensíveis, informações confidenciais ou dados desnecessários em campos que possam ser gravados em blockchain, metadados públicos, descrições de transações ou carteiras digitais.",
          ],
        },
        {
          title: "6. Direitos das pessoas titulares",
          paragraphs: [
            "A pessoa titular poderá solicitar confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos, inexatos ou desatualizados, anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD.",
            "Também poderá solicitar informações sobre compartilhamento de dados, revisão de decisões automatizadas, portabilidade quando aplicável e revogação do consentimento nos casos em que essa for a base legal utilizada.",
            "Pedidos relacionados a dados pessoais poderão ser enviados para o e-mail mulheresquecodam@gmail.com. As solicitações serão analisadas conforme a legislação aplicável, considerando também limitações técnicas relacionadas a registros públicos e imutáveis em blockchain.",
          ],
        },
        {
          title: "7. Segurança da informação",
          paragraphs: [
            "Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados pessoais contra acessos não autorizados, perda, alteração, divulgação indevida ou qualquer forma de tratamento inadequado.",
            "Apesar dos esforços de segurança, nenhum sistema é totalmente imune a riscos. A pessoa usuária também deve proteger suas credenciais, dispositivos, carteiras digitais, senhas, chaves privadas e frases de recuperação.",
            "A Mulheres Que Codam, o Instituto Florescer Caldeira e a ITS Cripto Educacional nunca solicitarão chaves privadas, seed phrases ou senhas de carteiras digitais.",
          ],
        },
        {
          title: "8. Retenção e exclusão de dados",
          paragraphs: [
            "Os dados pessoais serão mantidos pelo tempo necessário para cumprir as finalidades informadas nesta Política, obrigações legais ou regulatórias, exercício regular de direitos, auditorias, prestação de contas e prevenção a fraudes.",
            "Quando os dados não forem mais necessários, poderão ser eliminados ou anonimizados, observadas as hipóteses legais de retenção.",
            "Registros realizados em blockchain podem permanecer disponíveis na rede mesmo após solicitações de exclusão, em razão da natureza pública, distribuída e imutável dessa tecnologia.",
          ],
        },
        {
          title: "9. Alterações nesta Política",
          paragraphs: [
            "Esta Política de Privacidade poderá ser atualizada periodicamente para refletir mudanças na plataforma, nos contratos inteligentes, nas práticas de tratamento de dados, nos parceiros envolvidos ou na legislação aplicável.",
            "A versão mais recente estará sempre disponível nesta página, com indicação da data de última atualização.",
          ],
        },
      ]}
    />
  );
}
