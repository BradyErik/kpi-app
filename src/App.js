import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { createClient } from "@supabase/supabase-js";
import DatePicker from "react-datepicker";
import "./react-datepicker.css";
import classNames from "classnames";

const supabaseUrl = "https://odquktabcmooqunriymd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // shortened for brevity
const supabase = createClient(supabaseUrl, supabaseKey);

export default function KPIReportingApp() {
  const [form, setForm] = useState({
    date: "",
    branch: "",
    rep: "",
    one_time_quotes: "",
    one_time_sales: "",
    weekly_quotes: "",
    weekly_sales: "",
    biweekly_quotes: "",
    biweekly_sales: "",
    monthly_quotes: "",
    monthly_sales: "",
  });

  const [data, setData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedRep, setSelectedRep] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      one_time_quotes: parseInt(form.one_time_quotes, 10) || 0,
      one_time_sales: parseInt(form.one_time_sales, 10) || 0,
      weekly_quotes: parseInt(form.weekly_quotes, 10) || 0,
      weekly_sales: parseInt(form.weekly_sales, 10) || 0,
      biweekly_quotes: parseInt(form.biweekly_quotes, 10) || 0,
      biweekly_sales: parseInt(form.biweekly_sales, 10) || 0,
      monthly_quotes: parseInt(form.monthly_quotes, 10) || 0,
      monthly_sales: parseInt(form.monthly_sales, 10) || 0,
    };

    const { error } = await supabase.from("weekly_reports").insert([payload]);
    if (error) console.error("Insert error:", error);
    else fetchData();
  };

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("weekly_reports")
      .select()
      .order("date", { ascending: true });
    if (error) console.error("Fetch error:", error);
    else setData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const rowDate = new Date(row.date);
      return (
        (!selectedBranch || row.branch === selectedBranch) &&
        (!selectedRep || row.rep === selectedRep) &&
        (!startDate || rowDate >= startDate) &&
        (!endDate || rowDate <= endDate)
      );
    });
  }, [data, selectedBranch, selectedRep, startDate, endDate]);

  const totalQuotes = filteredData.reduce((sum, row) => sum + row.one_time_quotes + row.weekly_quotes + row.biweekly_quotes + row.monthly_quotes, 0);
  const totalSales = filteredData.reduce((sum, row) => sum + row.one_time_sales + row.weekly_sales + row.biweekly_sales + row.monthly_sales, 0);
  const conversionRate = totalQuotes > 0 ? ((totalSales / totalQuotes) * 100).toFixed(1) : "0.0";

  const totalsByBranch = useMemo(() => {
    const summary = {};
    data.forEach((row) => {
      const key = row.branch;
      if (!summary[key]) summary[key] = { quotes: 0, sales: 0 };
      summary[key].quotes += row.one_time_quotes + row.weekly_quotes + row.biweekly_quotes + row.monthly_quotes;
      summary[key].sales += row.one_time_sales + row.weekly_sales + row.biweekly_sales + row.monthly_sales;
    });
    return summary;
  }, [data]);

  const totalsByRep = useMemo(() => {
    const summary = {};
    data.forEach((row) => {
      const key = row.rep;
      if (!summary[key]) summary[key] = { quotes: 0, sales: 0 };
      summary[key].quotes += row.one_time_quotes + row.weekly_quotes + row.biweekly_quotes + row.monthly_quotes;
      summary[key].sales += row.one_time_sales + row.weekly_sales + row.biweekly_sales + row.monthly_sales;
    });
    return summary;
  }, [data]);

  const getConversionClass = (rate) => {
    if (rate >= 60) return "text-green-600 font-semibold";
    if (rate >= 40) return "text-yellow-600 font-medium";
    return "text-red-600 font-medium";
  };

  const getLineColor = (key) => {
    switch (key) {
      case "one_time_sales": return "#22c55e";
      case "weekly_sales": return "#3b82f6";
      case "biweekly_sales": return "#facc15";
      case "monthly_sales": return "#f43f5e";
      default: return "#8884d8";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold">Submit Weekly Report</h2>
          <Input type="date" onChange={(e) => handleChange("date", e.target.value)} />

          <Select onChange={(val) => handleChange("branch", val)} options={[{ label: "ACS", value: "ACS" }, { label: "ACSNW", value: "ACSNW" }]} />
          <Select onChange={(val) => handleChange("rep", val)} options={[{ label: "Kari", value: "Kari" }, { label: "Ashley", value: "Ashley" }, { label: "Ronda", value: "Ronda" }, { label: "Lisa", value: "Lisa" }]} />

          {["one_time", "weekly", "biweekly", "monthly"].map((type) => (
            <div key={type} className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder={`${type.replace("_", " ")} quotes`} onChange={(e) => handleChange(`${type}_quotes`, e.target.value)} />
              <Input type="number" placeholder={`${type.replace("_", " ")} sales`} onChange={(e) => handleChange(`${type}_sales`, e.target.value)} />
            </div>
          ))}

          <Button onClick={handleSubmit}>Submit</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Filter</h2>
          <Select defaultValue="" onChange={setSelectedBranch} options={[{ label: "All Branches", value: "" }, { label: "ACS", value: "ACS" }, { label: "ACSNW", value: "ACSNW" }]} />
          <Select defaultValue="" onChange={setSelectedRep} options={[{ label: "All Reps", value: "" }, { label: "Kari", value: "Kari" }, { label: "Ashley", value: "Ashley" }, { label: "Ronda", value: "Ronda" }, { label: "Lisa", value: "Lisa" }]} />
          <div className="flex gap-4">
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Start Date" className="border px-2 py-1 rounded" />
            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="End Date" className="border px-2 py-1 rounded" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Totals</h2>
          <p>Total Quotes: {totalQuotes}</p>
          <p>Total Sales: {totalSales}</p>
          <p className={getConversionClass(conversionRate)}>Conversion Rate: {conversionRate}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Totals by Branch</h2>
          {Object.entries(totalsByBranch).map(([branch, totals]) => {
            const rate = totals.quotes > 0 ? (totals.sales / totals.quotes) * 100 : 0;
            return (
              <p key={branch} className="mb-1">
                <strong>{branch}:</strong> {totals.quotes} Quotes, {totals.sales} Sales, <span className={getConversionClass(rate)}>{rate.toFixed(1)}% Conversion</span>
              </p>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Totals by Rep</h2>
          {Object.entries(totalsByRep).map(([rep, totals]) => {
            const rate = totals.quotes > 0 ? (totals.sales / totals.quotes) * 100 : 0;
            return (
              <p key={rep} className="mb-1">
                <strong>{rep}:</strong> {totals.quotes} Quotes, {totals.sales} Sales, <span className={getConversionClass(rate)}>{rate.toFixed(1)}% Conversion</span>
              </p>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Weekly Summary</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="one_time_sales" stroke={getLineColor("one_time_sales")} name="One-Time Sales" />
              <Line type="monotone" dataKey="weekly_sales" stroke={getLineColor("weekly_sales")} name="Weekly Sales" />
              <Line type="monotone" dataKey="biweekly_sales" stroke={getLineColor("biweekly_sales")} name="Bi-Weekly Sales" />
              <Line type="monotone" dataKey="monthly_sales" stroke={getLineColor("monthly_sales")} name="Monthly Sales" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
