import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Excluir conta e dados",
  description:
    "Como excluir sua conta do Movra e apagar todos os seus dados pessoais e de saúde.",
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 mb-2 text-lg font-bold tracking-tight">{children}</h2>;
}

export default function ExcluirContaPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">
        Excluir sua conta e seus dados
      </h1>
      <p>
        Você pode apagar sua conta do <strong>Movra</strong> e todos os
        dados vinculados a ela a qualquer momento, de duas formas.
      </p>

      <H>1. Pelo próprio app (imediato)</H>
      <p>
        Se você consegue entrar na sua conta, este é o caminho mais rápido:
      </p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Abra o app e acesse a aba <strong>Perfil</strong>.</li>
        <li>
          Toque em <strong>Excluir minha conta</strong> (seção de privacidade).
        </li>
        <li>Confirme. A exclusão é feita na hora e não pode ser desfeita.</li>
      </ol>
      <p>
        Antes de excluir, você também pode <strong>exportar seus dados</strong>{" "}
        (arquivo JSON) na mesma tela de Perfil.
      </p>

      <H>2. Por e-mail (se você não consegue acessar)</H>
      <p>
        Se não conseguir entrar no app, escreva para{" "}
        <strong>{LEGAL.contactEmail}</strong> a partir do e-mail cadastrado, com
        o assunto <strong>“Excluir minha conta”</strong>. Confirmamos sua
        identidade e concluímos a exclusão em <strong>até 15 dias</strong>.
      </p>

      <H>Quais dados são apagados</H>
      <p>A exclusão remove, de forma permanente:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Cadastro (nome, e-mail, WhatsApp) e credenciais de acesso;</li>
        <li>Perfil físico e objetivos;</li>
        <li>
          Dados de saúde declarados (limitações físicas) e medidas corporais;
        </li>
        <li>
          Fichas, treinos concluídos, cargas e repetições, evolução e conquistas;
        </li>
        <li>Inscrições de notificação (lembretes de treino).</li>
      </ul>

      <H>O que pode ser retido</H>
      <p>
        Podemos manter, apenas pelo período e na medida exigidos por lei,
        registros mínimos necessários para cumprir obrigações legais ou atender
        ordem judicial. Esses registros não são usados para nenhuma outra
        finalidade e são descartados ao fim do prazo legal.
      </p>

      <p className="text-muted-foreground mt-8 text-sm">
        Dúvidas sobre privacidade e seus direitos (LGPD art. 18) estão na{" "}
        <Link href="/privacidade" className="text-primary underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </>
  );
}
