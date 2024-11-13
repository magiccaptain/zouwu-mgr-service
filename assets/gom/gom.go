package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
)

type ResourceReport struct {
	Hostname     string `json:"hostname"`
	OS           string `json:"os"`
	OSVersion    string `json:"os_version"`
	DiskPath     string `json:"disk_path"`
	DiskTotal    uint64 `json:"disk_total"`
	DiskFree     uint64 `json:"disk_free"`
	MemTotal     uint64 `json:"mem_total"`
	MemAvailable uint64 `json:"mem_available"`
	CpuModel     string `json:"cpu_model"`
	CpuCores     int    `json:"cpu_cores"`
}

func (r ResourceReport) String() string {
	s, _ := json.Marshal(r)
	return string(s)
}

func main() {

	// 命令行第一个参数，磁盘分区路径, 默认为 /
	var path string
	if len(os.Args) > 1 {
		path = os.Args[1]
	} else {
		path = "/"
	}

	const gb_unit uint64 = 1024 * 1024 * 1024

	hInfo, _ := host.Info()

	v, _ := mem.VirtualMemory()

	d, _ := disk.Usage(path)

	cpuInfo, _ := cpu.Info()

	report := ResourceReport{
		Hostname:     hInfo.Hostname,
		OS:           hInfo.Platform,
		OSVersion:    hInfo.PlatformVersion,
		DiskPath:     path,
		DiskTotal:    d.Total / gb_unit,
		DiskFree:     d.Free / gb_unit,
		MemTotal:     v.Total / gb_unit,
		MemAvailable: v.Available / gb_unit,
		CpuModel:     cpuInfo[0].ModelName,
		CpuCores:     len(cpuInfo),
	}

	fmt.Println(report)
}
