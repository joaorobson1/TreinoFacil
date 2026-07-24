import type { Metadata } from "next";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o TreinoFácil coleta, usa e protege seus dados pessoais e de saúde.",
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 mb-2 text-lg font-bold tracking-tight">{children}</h2>;
}

export default function PrivacidadePage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Política de Privacidade</h1>
      <p className="text-muted-foreground">
        Última atualização: {LEGAL.lastUpdated}
      </p>

      <p>
        Esta política explica como o <strong>TreinoFácil</strong> trata seus dados
        pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei
        13.709/2018 — LGPD).
      </p>

      <H>1. Quem é o controlador</H>
      <p>
        O controlador dos dados é <strong>{LEGAL.controller}</strong> (
        {LEGAL.document}). Para exercer seus direitos ou tirar dúvidas sobre
        privacidade, escreva para <strong>{LEGAL.contactEmail}</strong>.
      </p>

      <H>2. Quais dados coletamos</H>
      <p>Coletamos apenas o necessário para montar e acompanhar seu treino:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Cadastro:</strong> nome, e-mail e WhatsApp.
        </li>
        <li>
          <strong>Perfil físico:</strong> sexo, idade, altura, peso, objetivo,
          experiência, dias e tempo disponíveis e local de treino.
        </li>
        <li>
          <strong>Dados de saúde (sensíveis):</strong> limitações físicas que você
          informa — como dor no joelho ou no ombro, hérnia de disco, problemas
          lombares e hipertensão. Usamos essa informação{" "}
          <em>exclusivamente</em> para evitar exercícios contraindicados na sua
          ficha.
        </li>
        <li>
          <strong>Medidas corporais:</strong> peso, altura, circunferências,
          percentual de gordura e IMC (calculado automaticamente), quando você os
          registra.
        </li>
        <li>
          <strong>Uso do app:</strong> treinos concluídos, cargas e repetições
          registradas, evolução por exercício, sequência de dias e conquistas.
        </li>
      </ul>
      <p>
        Não coletamos localização, contatos, fotos da sua galeria nem dados de
        pagamento.
      </p>

      <H>3. Base legal e consentimento</H>
      <p>
        O tratamento dos dados de cadastro e de perfil se apoia na execução do
        contrato (art. 7º, V). Os <strong>dados de saúde</strong> são dados
        pessoais sensíveis e só são tratados mediante o seu{" "}
        <strong>consentimento específico e destacado</strong> (art. 11, I), dado
        no momento do cadastro. Informar limitações é opcional — o app funciona
        sem elas, apenas sem esse ajuste de segurança.
      </p>

      <H>4. Como usamos os dados</H>
      <p>
        Usamos seus dados para: gerar a ficha adequada ao seu objetivo, nível,
        tempo e equipamentos; substituir exercícios incompatíveis com suas
        limitações; acompanhar sua evolução; e liberar conquistas. Não usamos seus
        dados para publicidade, não fazemos perfilamento para terceiros e{" "}
        <strong>não vendemos seus dados</strong>.
      </p>

      <H>5. Com quem compartilhamos</H>
      <p>
        Utilizamos a <strong>Supabase</strong> como operadora para hospedagem de
        banco de dados, autenticação e armazenamento de arquivos. O acesso é
        restrito e protegido por políticas de segurança em nível de linha (RLS),
        que impedem que um usuário veja os dados de outro. Fora isso, só
        compartilhamos dados por obrigação legal ou ordem judicial.
      </p>

      <H>6. Por quanto tempo guardamos</H>
      <p>
        Mantemos seus dados enquanto sua conta existir. Ao excluir a conta, os
        dados pessoais e de saúde vinculados a ela são apagados, salvo o que a lei
        exigir preservar.
      </p>

      <H>7. Seus direitos</H>
      <p>
        Você pode, a qualquer momento (art. 18 da LGPD): confirmar a existência de
        tratamento; acessar seus dados; corrigir dados incompletos ou desatualizados;
        solicitar anonimização, bloqueio ou eliminação; solicitar portabilidade;
        e revogar o consentimento. Para isso, escreva para{" "}
        <strong>{LEGAL.contactEmail}</strong>. Você também pode editar seu perfil
        e excluir sua conta pelo próprio app.
      </p>

      <H>8. Idade mínima</H>
      <p>
        O TreinoFácil é destinado a pessoas com <strong>16 anos ou mais</strong>.
        Não coletamos intencionalmente dados de crianças. Se identificarmos um
        cadastro abaixo dessa idade, a conta será removida.
      </p>

      <H>9. Segurança</H>
      <p>
        Os dados trafegam por conexão criptografada (HTTPS) e o acesso ao banco é
        controlado por autenticação e políticas por usuário. Nenhum sistema é
        totalmente imune, mas trabalhamos para reduzir riscos e corrigir falhas
        rapidamente.
      </p>

      <H>10. Alterações</H>
      <p>
        Se esta política mudar de forma relevante, avisaremos no app antes da
        mudança entrar em vigor.
      </p>
    </>
  );
}
