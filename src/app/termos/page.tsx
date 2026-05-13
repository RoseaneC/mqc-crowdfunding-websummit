import LegalPage from "../../components/legal/legalPage";

export const metadata = {
  title: "Termos de Uso | Mulheres Que Codam",
  description: "Termos e Condições de Uso da plataforma Mulheres Que Codam.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Termos"
      title="Termos e Condições de Uso"
      description="Estes termos definem as condições gerais para acesso e uso da plataforma de financiamento coletivo Mulheres Que Codam."
      lastUpdated="maio de 2026"
      sections={[
        {
          title: "1. Aceitação e objeto",
          paragraphs: [
            "Ao acessar ou utilizar a plataforma Mulheres Que Codam — Hub de Impacto, a pessoa usuária declara que leu, compreendeu e concorda com estes Termos e Condições de Uso.",
            "A plataforma tem como objeto facilitar doações, captação de recursos e apoio a projetos e startups fundadas ou lideradas por mulheres, utilizando infraestrutura tecnológica baseada na rede Stellar.",
            "Caso a pessoa usuária não concorde com qualquer disposição destes Termos, recomenda-se que não utilize a plataforma.",
          ],
        },
        {
          title: "2. Natureza da operação",
          paragraphs: [
            "Nesta fase inicial, a plataforma opera exclusivamente sob o regime de doação com encargo, nos termos do art. 553 do Código Civil Brasileiro, quando aplicável.",
            "As contribuições realizadas nesta etapa não constituem investimento, empréstimo, aplicação financeira, promessa de retorno financeiro, pagamento de juros, aquisição de participação societária, equity ou qualquer outro direito econômico sobre os projetos apoiados.",
            "A pessoa usuária reconhece que sua contribuição tem natureza de apoio financeiro a projetos selecionados, conforme as regras e informações disponibilizadas na plataforma.",
          ],
        },
        {
          title: "3. Tecnologia Stellar e ativos digitais de impacto",
          paragraphs: [
            "A plataforma pode utilizar a rede Stellar para registrar determinadas operações, conferir transparência ao fluxo financeiro e viabilizar a emissão de ativos digitais relacionados às contribuições realizadas.",
            "Ao confirmar uma contribuição, a pessoa doadora poderá receber um NFT ou outro registro digital na rede Stellar, que servirá como recibo digital ou comprovação tecnológica da operação realizada.",
            "A pessoa usuária reconhece que transações registradas em blockchain podem ser públicas, verificáveis, permanentes e irreversíveis após confirmação na rede.",
            "Antes de confirmar qualquer transação, a pessoa usuária deve revisar cuidadosamente os dados informados, incluindo valor, carteira conectada, chave pública, rede utilizada e demais informações exibidas pela plataforma ou pela carteira digital.",
          ],
        },
        {
          title: "4. Split de pagamento e destinação dos recursos",
          paragraphs: [
            "A plataforma poderá executar, de forma automatizada ou semi-automatizada, o rateio dos valores arrecadados entre a startup ou projeto apoiado, a organização parceira e a taxa de manutenção da plataforma, conforme regras previamente informadas.",
            "A distribuição dos recursos poderá depender de contratos inteligentes, integrações com carteiras digitais, infraestrutura de blockchain, parceiros operacionais e configurações técnicas da plataforma.",
            "Os percentuais, taxas, destinatários e critérios de repasse deverão ser apresentados de forma clara sempre que aplicáveis à operação realizada.",
          ],
        },
        {
          title: "5. Benefício fiscal e documentação",
          paragraphs: [
            "Quando aplicável, a documentação relacionada à doação poderá ser emitida por organização parceira cadastrada, observadas as regras fiscais, contábeis e legais pertinentes.",
            "A validade de recibos, comprovantes, NFTs ou registros digitais para fins fiscais dependerá da documentação legal emitida pela organização responsável, da natureza da doação, do enquadramento jurídico aplicável e da análise das autoridades competentes.",
            "A plataforma atua como ponte tecnológica e não garante, por si só, a aceitação de documentos, registros digitais ou recibos pela Receita Federal, por órgãos públicos, por auditores, por contadores ou por qualquer autoridade competente.",
            "A pessoa usuária é responsável por consultar orientação contábil, tributária ou jurídica própria antes de utilizar qualquer documento para fins de dedução, comprovação fiscal ou declaração de Imposto de Renda.",
          ],
        },
        {
          title: "6. Responsabilidades da pessoa usuária",
          paragraphs: [
            "A pessoa usuária compromete-se a utilizar a plataforma de forma ética, legal, transparente e compatível com sua finalidade.",
            "É responsabilidade da pessoa usuária fornecer informações verdadeiras, completas e atualizadas, bem como revisar os dados antes de confirmar qualquer operação.",
            "A pessoa usuária é responsável pela guarda e segurança de sua carteira digital, chaves privadas, senhas, dispositivos, frases de recuperação e demais mecanismos de autenticação.",
            "A Mulheres Que Codam, o Instituto Florescer Caldeira e a ITS Cripto Educacional nunca solicitarão chaves privadas, seed phrases ou senhas de carteiras digitais.",
          ],
        },
        {
          title: "7. Responsabilidades das ONGs, startups e projetos",
          paragraphs: [
            "As ONGs, startups, iniciativas e projetos cadastrados são responsáveis pela veracidade, integridade, atualização e legalidade das informações fornecidas à plataforma.",
            "Essas organizações também são responsáveis pela correta utilização dos recursos recebidos, pela prestação de contas aos parceiros envolvidos e pelo cumprimento das obrigações legais, fiscais, contábeis e regulatórias aplicáveis.",
            "A plataforma poderá remover, suspender ou revisar projetos que apresentem informações inconsistentes, indícios de irregularidade, descumprimento destes Termos ou incompatibilidade com os objetivos da iniciativa.",
          ],
        },
        {
          title: "8. Uso ético e prevenção a ilícitos",
          paragraphs: [
            "É proibido utilizar a plataforma para lavagem de dinheiro, financiamento de atividades ilícitas, fraude, ocultação de patrimônio, violação de sanções, simulação de operações ou qualquer finalidade contrária à legislação vigente.",
            "A plataforma poderá adotar medidas de verificação, monitoramento, bloqueio, suspensão ou comunicação a autoridades competentes quando houver suspeita de uso indevido, fraude ou irregularidade.",
            "A pessoa usuária declara que os recursos utilizados nas contribuições têm origem lícita e que a utilização da plataforma observará a legislação brasileira aplicável.",
          ],
        },
        {
          title: "9. Limitações técnicas e disponibilidade",
          paragraphs: [
            "A plataforma pode depender de serviços de terceiros, redes blockchain, carteiras digitais, provedores de infraestrutura, APIs externas, serviços de hospedagem e ferramentas de análise.",
            "Não garantimos disponibilidade ininterrupta, ausência total de falhas, compatibilidade com todas as carteiras ou funcionamento permanente de redes, exploradores, nós, RPCs ou provedores externos.",
            "A plataforma não se responsabiliza por falhas causadas exclusivamente por serviços de terceiros, indisponibilidade de rede, erro da pessoa usuária, incompatibilidade de carteira, congestionamento da blockchain ou uso inadequado da aplicação.",
          ],
        },
        {
          title: "10. Propriedade intelectual",
          paragraphs: [
            "Marcas, nomes, logotipos, identidade visual, textos, interfaces, componentes, conteúdos e demais elementos da plataforma são protegidos por direitos de propriedade intelectual, salvo indicação em contrário.",
            "O uso da plataforma não concede à pessoa usuária qualquer licença, cessão ou autorização para reprodução, exploração comercial, modificação ou distribuição dos elementos protegidos sem autorização prévia e expressa.",
          ],
        },
        {
          title: "11. Privacidade e proteção de dados",
          paragraphs: [
            "O tratamento de dados pessoais realizado no contexto da plataforma observará a Política de Privacidade e a legislação aplicável, especialmente a Lei Geral de Proteção de Dados Pessoais.",
            "Ao utilizar a plataforma, a pessoa usuária reconhece que determinadas informações registradas em blockchain podem ser públicas, permanentes e tecnicamente difíceis ou impossíveis de excluir.",
            "Recomenda-se a leitura atenta da Política de Privacidade antes da utilização da plataforma.",
          ],
        },
        {
          title: "12. Alterações nos Termos",
          paragraphs: [
            "Estes Termos e Condições de Uso poderão ser atualizados periodicamente para refletir mudanças na plataforma, nos contratos inteligentes, nas funcionalidades, nas regras operacionais, nos parceiros envolvidos ou na legislação aplicável.",
            "A versão vigente estará sempre disponível nesta página, com indicação da data de última atualização.",
            "A continuidade de uso da plataforma após a publicação de alterações implica ciência e concordância com a versão atualizada destes Termos.",
          ],
        },
        {
          title: "13. Foro e legislação aplicável",
          paragraphs: [
            "Estes Termos são regidos pelas leis da República Federativa do Brasil.",
            "Fica eleito o foro da Comarca do Rio de Janeiro, Estado do Rio de Janeiro, para dirimir eventuais controvérsias decorrentes destes Termos, salvo disposição legal em sentido contrário.",
          ],
        },
      ]}
    />
  );
}
