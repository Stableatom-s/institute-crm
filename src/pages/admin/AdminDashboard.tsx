import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { leadService } from "../../services/leadService";
import { demoService, DemoItem } from "../../services/demoService";
import { batchService, BatchItem } from "../../services/batchService";
import { financeService } from "../../services/financeService";

interface ScheduledDemoItem {
  srNo: string;
  name: string;
  timeSlot: string;
  demoDate: string;
  course: string;
  mode: "Online" | "Offline";
  faculty: string;
}

interface OngoingBatchItem {
  srNo: string;
  batch: string;
  startDate: string;
  course: string;
  faculty: string;
  studentCount: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [demos, setDemos] = useState<ScheduledDemoItem[]>([]);
  const [batches, setBatches] = useState<OngoingBatchItem[]>([]);
  const [leadsCountToday, setLeadsCountToday] = useState<number>(0);
  const [activeBatchesCount, setActiveBatchesCount] = useState<number>(0);
  const [paymentDueCount, setPaymentDueCount] = useState<number>(0);

  // Pipeline metrics
  const [newCount, setNewCount] = useState<number>(0);
  const [contactedCount, setContactedCount] = useState<number>(0);
  const [demoScheduledCount, setDemoScheduledCount] = useState<number>(0);
  const [interestedCount, setInterestedCount] = useState<number>(0);
  const [convertedCount, setConvertedCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        setIsLoading(true);
        const [allLeads, allDemos, allBatches, allInvoices] = await Promise.all([
          leadService.getAllLeads().catch(() => []),
          demoService.getAllDemos().catch(() => []),
          batchService.getAllBatches().catch(() => []),
          financeService.getAllInvoices().catch(() => []),
        ]);

        const todayStr = new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "-");
        const todayLeads = allLeads.filter(
          (l: any) =>
            l.enquiryDate === todayStr ||
            l.createdAt?.startsWith(new Date().toISOString().split("T")[0])
        ).length;
        setLeadsCountToday(todayLeads);

        setNewCount(
          allLeads.filter((l: any) => l.status === "New" || !l.status).length
        );
        setContactedCount(
          allLeads.filter((l: any) => l.status === "Contacted").length
        );
        setDemoScheduledCount(
          allLeads.filter((l: any) => l.status === "Demo Scheduled").length
        );
        setInterestedCount(
          allLeads.filter((l: any) => l.status === "Interested").length
        );
        setConvertedCount(
          allLeads.filter(
            (l: any) => l.status === "Enrolled" || l.status === "Converted"
          ).length
        );

        const dueInvoices = allInvoices.filter(
          (inv: any) =>
            inv.status === "Partially Paid" ||
            inv.status === "Overdue" ||
            inv.status === "Pending"
        ).length;
        setPaymentDueCount(dueInvoices);

        const scheduled = allDemos.filter(
          (d: DemoItem) => d.status === "Scheduled"
        );
        setDemos(
          scheduled.map((d: DemoItem, idx: number) => ({
            srNo: String(idx + 1).padStart(2, "0"),
            name: `${d.name} ${d.lastName || ""}`.trim(),
            timeSlot: d.timeSlot || "11:00 - 12:00",
            demoDate: d.demoDate || todayStr,
            course: d.course || "UI/UX Design",
            mode: (d.mode === "Offline" ? "Offline" : "Online") as
              | "Online"
              | "Offline",
            faculty: d.faculty || "Faculty Member",
          }))
        );

        setActiveBatchesCount(allBatches.length);
        setBatches(
          allBatches.map((b: BatchItem, idx: number) => ({
            srNo: String(idx + 1).padStart(2, "0"),
            batch: b.batchCode || `Batch ${idx + 1}`,
            startDate: b.startDate || todayStr,
            course: b.course || "UI/UX Design",
            faculty: b.faculty || "Faculty Member",
            studentCount: String(b.students?.length || 0).padStart(2, "0"),
          }))
        );
      } catch (err) {
        console.error("Failed to load admin dashboard live metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  return (
    <div className="font-['Onest'] text-[#050720] space-y-6 pb-16">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-['Sora']">Dashboard</h1>
        <button
          onClick={() => navigate("/admin/leads", { state: { openAddModal: true } })}
          className="flex items-center gap-2 bg-[#FFB908] hover:bg-[#E5A607] text-[#050720] px-4 py-2 rounded-lg font-bold text-xs transition-colors shadow-xs cursor-pointer"
        >
          <span className="text-base leading-none font-extrabold">+</span> Add new lead
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overview Box */}
        <div className="relative bg-white rounded-2xl border border-[#050720]/10 p-6 shadow-xs">
          {/* Smooth Yellow/Orange Vertical Pill Accent matching Figma */}
          <div className="absolute left-0 top-3 bottom-3 w-2 bg-[#FFB908] rounded-r-full" />

          <div className="pl-3">
            <h3 className="text-sm font-bold font-['Sora']">Overview</h3>
            <span className="text-[10px] text-[#050720]/50 block mt-0.5">
              This month
            </span>

            <div className="grid grid-cols-4 gap-2 text-center mt-6">
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">
                  Leads created today
                </span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(leadsCountToday).padStart(2, "0")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">
                  Today&apos;s Demos
                </span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(demos.length).padStart(2, "0")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">
                  Active Batches
                </span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(activeBatchesCount).padStart(2, "0")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">
                  Payment Due
                </span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(paymentDueCount).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Pipeline Snapshot Box */}
        <div className="relative bg-white rounded-2xl border border-[#050720]/10 p-6 shadow-xs">
          {/* Smooth Yellow/Orange Vertical Pill Accent matching Figma */}
          <div className="absolute left-0 top-3 bottom-3 w-2 bg-[#FFB908] rounded-r-full" />

          <div className="pl-3">
            <h3 className="text-sm font-bold font-['Sora']">
              Lead Pipeline Snapshot
            </h3>
            <span className="text-[10px] text-[#050720]/50 block mt-0.5">
              This month
            </span>

            <div className="grid grid-cols-5 gap-1 text-center mt-6">
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">
                  New
                </span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(newCount).padStart(2, "0")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">
                  Contacted
                </span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(contactedCount).padStart(2, "0")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">
                  Demo Scheduled
                </span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(demoScheduledCount).padStart(2, "0")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">
                  Interested
                </span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(interestedCount).padStart(2, "0")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">
                  Converted
                </span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(convertedCount).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold font-['Sora']">Scheduled Demos</h3>
          <button
            onClick={() => navigate("/admin/demos")}
            className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#050720]/50">
            Loading scheduled demos...
          </div>
        ) : demos.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#050720]/50">
            No demos scheduled at this moment.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                <th className="pb-3.5 font-semibold">Sr. No.</th>
                <th className="pb-3.5 font-semibold">Name</th>
                <th className="pb-3.5 font-semibold">Time Slot</th>
                <th className="pb-3.5 font-semibold">Demo Date</th>
                <th className="pb-3.5 font-semibold">Course</th>
                <th className="pb-3.5 font-semibold">Mode</th>
                <th className="pb-3.5 font-semibold">Faculty</th>
                <th className="pb-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
              {demos.slice(0, 5).map((demo) => (
                <tr
                  key={demo.srNo}
                  className="hover:bg-[#FFB908]/5 transition-colors"
                >
                  <td className="py-3.5 text-[#050720]/70">{demo.srNo}</td>
                  <td className="py-3.5 font-medium">{demo.name}</td>
                  <td className="py-3.5 text-[#050720]/70">{demo.timeSlot}</td>
                  <td className="py-3.5 text-[#050720]/70">{demo.demoDate}</td>
                  <td className="py-3.5 text-[#050720]/70">{demo.course}</td>
                  <td className="py-3.5 text-[#050720]/70">{demo.mode}</td>
                  <td className="py-3.5 text-[#050720]/70">{demo.faculty}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => navigate("/admin/demos")}
                      className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold font-['Sora']">Ongoing Batches</h3>
          <button
            onClick={() => navigate("/admin/batch")}
            className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#050720]/50">
            Loading batches...
          </div>
        ) : batches.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#050720]/50">
            No active batches found.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                <th className="pb-3.5 font-semibold">Sr. No.</th>
                <th className="pb-3.5 font-semibold">Batch</th>
                <th className="pb-3.5 font-semibold">Start Date</th>
                <th className="pb-3.5 font-semibold">Course</th>
                <th className="pb-3.5 font-semibold">Faculty</th>
                <th className="pb-3.5 font-semibold">Student count</th>
                <th className="pb-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
              {batches.slice(0, 5).map((batch) => (
                <tr
                  key={batch.srNo}
                  className="hover:bg-[#FFB908]/5 transition-colors"
                >
                  <td className="py-3.5 text-[#050720]/70">{batch.srNo}</td>
                  <td className="py-3.5 font-medium">{batch.batch}</td>
                  <td className="py-3.5 text-[#050720]/70">
                    {batch.startDate}
                  </td>
                  <td className="py-3.5 text-[#050720]/70">{batch.course}</td>
                  <td className="py-3.5 text-[#050720]/70">{batch.faculty}</td>
                  <td className="py-3.5 text-[#050720]/70">
                    {batch.studentCount}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => navigate("/admin/batch")}
                      className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#050720]/5 text-xs text-[#050720]/70">
          <span className="text-[11px]">Jump to</span>
          <input
            type="text"
            defaultValue="01"
            className="w-8 h-7 text-center border border-[#050720]/20 rounded text-xs text-[#050720] font-semibold"
          />
          <div className="flex items-center gap-1.5 ml-2">
            <button className="p-1 hover:text-[#050720] cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-semibold text-[#050720]">
              01 of 10
            </span>
            <button className="p-1 hover:text-[#050720] cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};