"use client";

import { toast } from "sonner";
import {
  Pencil,
  FileDown,
  Send,
  FileText,
  FileSignature,
  ClipboardList,
  ListChecks,
  RefreshCw,
  Link2,
  Copy,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { OperationsTab } from "./operations-tab";
import { QuotationDocument } from "./quotation-document";
import { ContractDocument } from "./contract-document";
import { EventOrderDocument } from "./event-order-document";
import { useStore } from "@/lib/store";
import type { EventRecord } from "@/lib/types";

export function DocumentsTab({ record }: { record: EventRecord }) {
  const { setStatus } = useStore();

  function generatePdf(doc: string) {
    toast.success(`${doc} ready`, {
      description: "Opening the print/PDF dialog…",
    });
    setTimeout(() => window.print(), 350);
  }

  async function sendToClient() {
    await setStatus(record.id, "Quotation Sent");
    toast.success("Quotation sent to client", {
      description: `Emailed to ${
        record.client.email || "the client"
      }. Status set to “Quotation Sent”.`,
    });
  }

  return (
    <div>
      <Tabs defaultValue="quotation">
        <TabsList className="no-print flex-wrap">
          <TabsTrigger value="quotation">
            <FileText className="h-4 w-4" />
            Quotation
          </TabsTrigger>
          <TabsTrigger value="contract">
            <FileSignature className="h-4 w-4" />
            Contract
          </TabsTrigger>
          <TabsTrigger value="order">
            <ClipboardList className="h-4 w-4" />
            Event Order
          </TabsTrigger>
          <TabsTrigger value="checklist">
            <ListChecks className="h-4 w-4" />
            Checklist
          </TabsTrigger>
        </TabsList>

        {/* QUOTATION */}
        <TabsContent value="quotation" className="mt-4">
          <DocLayout
            record={record}
            docName="Quotation"
            onGenerate={() => generatePdf("Quotation")}
            onSend={sendToClient}
          >
            <QuotationDocument record={record} />
          </DocLayout>
        </TabsContent>

        {/* CONTRACT */}
        <TabsContent value="contract" className="mt-4">
          <DocLayout
            record={record}
            docName="Contract"
            onGenerate={() => generatePdf("Contract")}
          >
            <ContractDocument record={record} />
          </DocLayout>
        </TabsContent>

        {/* EVENT ORDER */}
        <TabsContent value="order" className="mt-4">
          <DocLayout
            record={record}
            docName="Event Order"
            onGenerate={() => generatePdf("Event Order")}
          >
            <EventOrderDocument record={record} />
          </DocLayout>
        </TabsContent>

        {/* CHECKLIST */}
        <TabsContent value="checklist" className="mt-4">
          <OperationsTab record={record} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ----------------------------- Document layout ---------------------------- */

function DocLayout({
  record,
  docName,
  onGenerate,
  onEdit,
  onSend,
  children,
}: {
  record: EventRecord;
  docName: string;
  onGenerate: () => void;
  onEdit?: () => void;
  onSend?: () => void;
  children: React.ReactNode;
}) {
  const shareUrl = `https://app.vero.ph/share/${record.id.slice(-6)}`;

  function copyLink() {
    navigator.clipboard?.writeText(shareUrl).then(
      () => toast.success("Share link copied"),
      () => toast.error("Couldn't copy link")
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">{children}</div>

      {/* Action rail */}
      <div className="no-print space-y-4">
        <Card className="p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Document Actions
          </div>
          <div className="space-y-2">
            <Button className="w-full justify-start" onClick={onGenerate}>
              <RefreshCw className="h-4 w-4" /> Generate / Regenerate
            </Button>
            {onEdit && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" /> Edit Before Generating
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onGenerate}
            >
              <FileDown className="h-4 w-4" /> Download PDF
            </Button>
            {onSend && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onSend}
              >
                <Send className="h-4 w-4" /> Send to Client
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Link2 className="h-3.5 w-3.5" /> Share Link
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            Anyone with the link can view.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate rounded-md border bg-muted/50 px-2.5 py-1.5 text-xs">
              {shareUrl}
            </div>
            <Button variant="outline" size="icon" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Document History
          </div>
          <ul className="space-y-3 text-sm">
            <HistoryItem
              title={`${docName} updated`}
              time={record.updatedAt}
            />
            <HistoryItem title="Event Record created" time={record.createdAt} />
          </ul>
        </Card>
      </div>
    </div>
  );
}

function HistoryItem({ title, time }: { title: string; time: string }) {
  const d = new Date(time);
  const when = isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{when}</div>
      </div>
    </li>
  );
}

