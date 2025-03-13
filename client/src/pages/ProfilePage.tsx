import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// KYC form schema
const kycSchema = z.object({
  idType: z.string().min(1, "ID type is required"),
  idNumber: z.string().min(1, "ID number is required"),
  addressProof: z.string().min(1, "Address proof is required"),
});

type KycFormData = z.infer<typeof kycSchema>;

// Bank account form schema
const bankAccountSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  ifscCode: z.string().min(1, "IFSC code is required"),
  isDefault: z.boolean().default(false),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch KYC details
  const { data: kycDetails, isLoading: kycLoading } = useQuery({
    queryKey: ['/api/kyc'],
    retry: false,
    enabled: !!user
  });

  // Fetch bank accounts
  const { data: bankAccounts, isLoading: bankAccountsLoading } = useQuery({
    queryKey: ['/api/bank-accounts'],
    retry: false,
    enabled: !!user
  });

  // KYC form
  const {
    register: registerKyc,
    handleSubmit: handleSubmitKyc,
    formState: { errors: kycErrors },
  } = useForm<KycFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      idType: "",
      idNumber: "",
      addressProof: ""
    }
  });

  // Bank account form
  const {
    register: registerBankAccount,
    handleSubmit: handleSubmitBankAccount,
    formState: { errors: bankAccountErrors },
    reset: resetBankAccountForm
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      isDefault: false
    }
  });

  // Submit KYC mutation
  const submitKycMutation = useMutation({
    mutationFn: async (data: KycFormData) => {
      const response = await apiRequest('POST', '/api/kyc', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "KYC Submitted",
        description: "Your KYC details have been submitted for verification.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/kyc'] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit KYC details",
        variant: "destructive"
      });
    }
  });

  // Submit bank account mutation
  const submitBankAccountMutation = useMutation({
    mutationFn: async (data: BankAccountFormData) => {
      const response = await apiRequest('POST', '/api/bank-accounts', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bank Account Added",
        description: "Your bank account has been added successfully.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      resetBankAccountForm();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to add bank account",
        variant: "destructive"
      });
    }
  });

  // Set default bank account mutation
  const setDefaultBankAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      const response = await apiRequest('PUT', `/api/bank-accounts/${accountId}/default`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Default Account Updated",
        description: "Your default bank account has been updated.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update default bank account",
        variant: "destructive"
      });
    }
  });

  const onSubmitKyc = (data: KycFormData) => {
    submitKycMutation.mutate(data);
  };

  const onSubmitBankAccount = (data: BankAccountFormData) => {
    submitBankAccountMutation.mutate(data);
  };

  const handleSetDefaultBankAccount = (accountId: number) => {
    setDefaultBankAccountMutation.mutate(accountId);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-md text-xs">Verified</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 rounded-md text-xs">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500 bg-opacity-20 text-red-400 rounded-md text-xs">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500 bg-opacity-20 text-gray-400 rounded-md text-xs">Not Submitted</span>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 overflow-auto">
        <Header toggleSidebar={toggleSidebar} title="Profile & Settings" />
        
        <main className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
              <TabsTrigger value="bank">Bank Accounts</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card className="bg-dark-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Personal Information</CardTitle>
                  <CardDescription className="text-gray-400">Review and update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  {user ? (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white mb-4 md:mb-0">
                          {user.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-white">{user.fullName}</h3>
                          <p className="text-gray-400">{user.username}</p>
                          <div className="flex items-center mt-2">
                            <i className="ri-checkbox-circle-fill text-green-500 mr-2"></i>
                            <span className="text-gray-300 text-sm">Premium Member</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="fullName" className="text-gray-400">Full Name</Label>
                          <Input 
                            id="fullName" 
                            value={user.fullName} 
                            className="mt-1 bg-gray-800 border-gray-700 text-white" 
                            disabled
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email" className="text-gray-400">Email Address</Label>
                          <Input 
                            id="email" 
                            value={user.email} 
                            className="mt-1 bg-gray-800 border-gray-700 text-white" 
                            disabled
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone" className="text-gray-400">Phone Number</Label>
                          <Input 
                            id="phone" 
                            value={user.phoneNumber || "Not provided"} 
                            className="mt-1 bg-gray-800 border-gray-700 text-white" 
                            disabled
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="kycStatus" className="text-gray-400">KYC Status</Label>
                          <div className="mt-1 h-10 px-3 flex items-center bg-gray-800 border border-gray-700 rounded-md">
                            {getKycStatusBadge(kycDetails?.status || "not_submitted")}
                          </div>
                        </div>
                      </div>
                      
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <i className="ri-edit-line mr-2"></i>
                        Edit Profile
                      </Button>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-2 text-gray-400">Loading profile information...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="kyc">
              <Card className="bg-dark-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">KYC Verification</CardTitle>
                  <CardDescription className="text-gray-400">
                    Complete your KYC verification to unlock additional features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {kycLoading ? (
                    <div className="py-4 text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-2 text-gray-400">Loading KYC information...</p>
                    </div>
                  ) : kycDetails ? (
                    <div className="space-y-6">
                      <div className="bg-dark-card-hover p-4 rounded-lg">
                        <div className="flex items-center space-x-4 mb-4">
                          {kycDetails.status === "verified" ? (
                            <i className="ri-checkbox-circle-fill text-3xl text-green-500"></i>
                          ) : kycDetails.status === "pending" ? (
                            <i className="ri-time-line text-3xl text-yellow-500"></i>
                          ) : (
                            <i className="ri-close-circle-fill text-3xl text-red-500"></i>
                          )}
                          <div>
                            <h4 className="text-lg font-medium text-white">KYC {kycDetails.status.charAt(0).toUpperCase() + kycDetails.status.slice(1)}</h4>
                            <p className="text-sm text-gray-400">
                              {kycDetails.status === "verified" 
                                ? "Your KYC has been verified successfully" 
                                : kycDetails.status === "pending" 
                                ? "Your KYC is under review" 
                                : "Your KYC verification was rejected"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">ID Type</p>
                            <p className="font-medium text-white">{kycDetails.idType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">ID Number</p>
                            <p className="font-medium text-white">{kycDetails.idNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Submitted On</p>
                            <p className="font-medium text-white">
                              {new Date(kycDetails.submissionDate).toLocaleDateString('en-US', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          {kycDetails.verificationDate && (
                            <div>
                              <p className="text-sm text-gray-400">Verified On</p>
                              <p className="font-medium text-white">
                                {new Date(kycDetails.verificationDate).toLocaleDateString('en-US', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitKyc(onSubmitKyc)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="idType" className="text-gray-400">ID Type</Label>
                          <select
                            id="idType"
                            className={`mt-1 w-full bg-gray-800 border-${kycErrors.idType ? 'red-500' : 'gray-700'} text-white rounded-md px-3 py-2`}
                            {...registerKyc("idType")}
                          >
                            <option value="">Select ID Type</option>
                            <option value="Aadhaar">Aadhaar Card</option>
                            <option value="PAN">PAN Card</option>
                            <option value="Passport">Passport</option>
                            <option value="Driving License">Driving License</option>
                            <option value="Voter ID">Voter ID</option>
                          </select>
                          {kycErrors.idType && (
                            <p className="text-red-500 text-xs mt-1">{kycErrors.idType.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="idNumber" className="text-gray-400">ID Number</Label>
                          <Input 
                            id="idNumber" 
                            className={`mt-1 bg-gray-800 border-${kycErrors.idNumber ? 'red-500' : 'gray-700'} text-white`} 
                            {...registerKyc("idNumber")}
                          />
                          {kycErrors.idNumber && (
                            <p className="text-red-500 text-xs mt-1">{kycErrors.idNumber.message}</p>
                          )}
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label htmlFor="addressProof" className="text-gray-400">Address Proof</Label>
                          <select
                            id="addressProof"
                            className={`mt-1 w-full bg-gray-800 border-${kycErrors.addressProof ? 'red-500' : 'gray-700'} text-white rounded-md px-3 py-2`}
                            {...registerKyc("addressProof")}
                          >
                            <option value="">Select Address Proof</option>
                            <option value="Utility Bill">Utility Bill</option>
                            <option value="Bank Statement">Bank Statement</option>
                            <option value="Rent Agreement">Rent Agreement</option>
                          </select>
                          {kycErrors.addressProof && (
                            <p className="text-red-500 text-xs mt-1">{kycErrors.addressProof.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-dark-card-hover p-4 rounded-lg">
                        <div className="flex items-center">
                          <i className="ri-information-line text-xl text-blue-500 mr-2"></i>
                          <p className="text-sm text-gray-300">
                            Please ensure all the provided information is correct. This information will be used for verification purposes.
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={submitKycMutation.isPending}
                      >
                        {submitKycMutation.isPending && <i className="ri-loader-2-line animate-spin mr-2"></i>}
                        Submit KYC
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bank">
              <Card className="bg-dark-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Bank Accounts</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your bank accounts for loan disbursements and EMI payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bankAccountsLoading ? (
                    <div className="py-4 text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-2 text-gray-400">Loading bank accounts...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Existing Bank Accounts */}
                      {bankAccounts && bankAccounts.length > 0 ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-white">Your Bank Accounts</h3>
                          {bankAccounts.map((account: any) => (
                            <div key={account.id} className="bg-dark-card-hover p-4 rounded-lg">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center mb-4 md:mb-0">
                                  <div className="w-10 h-10 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center text-blue-500">
                                    <i className="ri-bank-line"></i>
                                  </div>
                                  <div className="ml-3">
                                    <div className="flex items-center">
                                      <p className="font-medium text-white">{account.bankName}</p>
                                      {account.isDefault && (
                                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-500 bg-opacity-20 text-green-400 rounded-md">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-400">
                                      XXXX XXXX XXXX {account.accountNumber.slice(-4)}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {!account.isDefault && (
                                    <Button 
                                      variant="outline" 
                                      className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                                      onClick={() => handleSetDefaultBankAccount(account.id)}
                                      disabled={setDefaultBankAccountMutation.isPending}
                                    >
                                      {setDefaultBankAccountMutation.isPending ? (
                                        <i className="ri-loader-2-line animate-spin mr-2"></i>
                                      ) : (
                                        <i className="ri-check-line mr-2"></i>
                                      )}
                                      Set as Default
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-dark-card-hover p-6 rounded-lg text-center">
                          <i className="ri-bank-line text-4xl text-gray-500 mb-2"></i>
                          <h4 className="text-lg font-medium text-white mb-1">No Bank Accounts</h4>
                          <p className="text-sm text-gray-400 mb-4">
                            You haven't added any bank accounts yet.
                          </p>
                        </div>
                      )}
                      
                      {/* Add New Bank Account */}
                      <div className="pt-6 border-t border-gray-800">
                        <h3 className="text-lg font-medium text-white mb-4">Add New Bank Account</h3>
                        <form onSubmit={handleSubmitBankAccount(onSubmitBankAccount)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor="bankName" className="text-gray-400">Bank Name</Label>
                              <Input 
                                id="bankName" 
                                className={`mt-1 bg-gray-800 border-${bankAccountErrors.bankName ? 'red-500' : 'gray-700'} text-white`} 
                                {...registerBankAccount("bankName")}
                              />
                              {bankAccountErrors.bankName && (
                                <p className="text-red-500 text-xs mt-1">{bankAccountErrors.bankName.message}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="accountNumber" className="text-gray-400">Account Number</Label>
                              <Input 
                                id="accountNumber" 
                                className={`mt-1 bg-gray-800 border-${bankAccountErrors.accountNumber ? 'red-500' : 'gray-700'} text-white`} 
                                {...registerBankAccount("accountNumber")}
                              />
                              {bankAccountErrors.accountNumber && (
                                <p className="text-red-500 text-xs mt-1">{bankAccountErrors.accountNumber.message}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="ifscCode" className="text-gray-400">IFSC Code</Label>
                              <Input 
                                id="ifscCode" 
                                className={`mt-1 bg-gray-800 border-${bankAccountErrors.ifscCode ? 'red-500' : 'gray-700'} text-white`} 
                                {...registerBankAccount("ifscCode")}
                              />
                              {bankAccountErrors.ifscCode && (
                                <p className="text-red-500 text-xs mt-1">{bankAccountErrors.ifscCode.message}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center">
                              <input
                                id="isDefault"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
                                {...registerBankAccount("isDefault")}
                              />
                              <Label htmlFor="isDefault" className="ml-2 text-gray-400">Set as default account</Label>
                            </div>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={submitBankAccountMutation.isPending}
                          >
                            {submitBankAccountMutation.isPending && <i className="ri-loader-2-line animate-spin mr-2"></i>}
                            Add Bank Account
                          </Button>
                        </form>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card className="bg-dark-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your account security and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-dark-card-hover p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Change Password</h4>
                          <p className="text-sm text-gray-400">Update your account password</p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Change Password
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-dark-card-hover p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                        </div>
                        <Button className="bg-gray-700 hover:bg-gray-600">
                          Enable
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-dark-card-hover p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Session Management</h4>
                          <p className="text-sm text-gray-400">Manage your active sessions</p>
                        </div>
                        <Button className="bg-gray-700 hover:bg-gray-600">
                          View Sessions
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-dark-card-hover p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Delete Account</h4>
                          <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="destructive">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
